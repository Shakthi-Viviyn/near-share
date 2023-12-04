import boto3
import uuid
import json
import dynamodbgeo
import urllib.parse

s3 = boto3.client('s3',
        endpoint_url='https://s3.ca-central-1.amazonaws.com')

dynamodb = boto3.client('dynamodb', region_name='ca-central-1')
config = dynamodbgeo.GeoDataManagerConfiguration(dynamodb, 'near-share-object-table')
config.hashKeyLength = 10
geoDataManager = dynamodbgeo.GeoDataManager(config)
        
def getExtension(fileName):
    parts = fileName.split(".")
    if (len(parts) > 1):
        return ("." + parts[-1])
    raise Exception("--No file extension---")

def lambda_handler(event, context):

    print(event)
    
    object_key = urllib.parse.unquote(event['Records'][0]['s3']['object']['key'])
    
    # Create a new globally unique file name
    new_object_key = str(uuid.uuid4()) + getExtension(object_key)
    
    # Copy & delete the object with original name
    s3.copy_object(Bucket='near-share-bucket', CopySource={'Bucket': 'near-share-bucket', 'Key': object_key}, Key=new_object_key)
    s3.delete_object(Bucket='near-share-bucket', Key=object_key)

    # Fetch the metaData associated with the object
    response = s3.head_object(Bucket='near-share-bucket', Key=new_object_key)
    metadata = response['Metadata']
    
    print(metadata)
    
    latitude = float(metadata['latitude'])
    longitude = float(metadata['longitude'])
    ownderId = metadata['ownerid']
    originalName = metadata['originalname']
    expiryDuration = int(metadata['expiryduration'])
    
    # Generate GET pre=signed URL to save to the DB
    getUrl = s3.generate_presigned_url('get_object', Params={'Bucket': 'near-share-bucket', 
                                                            'Key': new_object_key, 
                                                            'ResponseContentDisposition': f'attachment; filename="{originalName}"'
                                                            },
                                                            ExpiresIn=expiryDuration)
    
    PutItemInput = {
        'Item': {
            'ownerId': {'S': ownderId},
            'originalName': {'S': originalName},
            'url': {'S': getUrl},
        },
        'ConditionExpression': "attribute_not_exists(hashKey)"
    }
    # Add the geospatial data of the object to the dynamo table using dynamodbgeo
    geoDataManager.put_Point(dynamodbgeo.PutPointInput(
        dynamodbgeo.GeoPoint(latitude, longitude), # latitude then longitude
        new_object_key, # new object key used for rangeKey
        PutItemInput
    ))
    
    
    # Sending a sqs message with delay = object_expiration to auto-delete the object
    sqs = boto3.client("sqs")
    queue_url = "https://sqs.ca-central-1.amazonaws.com/225371949145/objectDeleteDelayQueue"
    
    message = json.dumps({
        "ownderId": ownderId,
        "expiryDuration": expiryDuration,
        "rangeKey": new_object_key,
        "latitude": latitude,
        "longitude": longitude
    })
    
    response = sqs.send_message(
        QueueUrl=queue_url,
        MessageBody=message,
        DelaySeconds=expiryDuration
    )
        
    print(response)
    
    return None
