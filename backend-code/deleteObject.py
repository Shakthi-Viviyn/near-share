import boto3
import json
import dynamodbgeo

def lambda_handler(event, context):
    
    print(event)
    
    dynamodb = boto3.client('dynamodb', region_name='ca-central-1')
    config = dynamodbgeo.GeoDataManagerConfiguration(dynamodb, 'near-share-object-table')
    config.hashKeyLength = 10
    geoDataManager = dynamodbgeo.GeoDataManager(config)
    
    data = json.loads(event['Records'][0]['body'])
    
    DeleteItemDict = {
        "ReturnValues": "ALL_OLD"
    }
    
    response = geoDataManager.delete_Point(
        dynamodbgeo.DeleteItemInput(
            dynamodbgeo.GeoPoint(data['latitude'],data['longitude']), 
            data['rangeKey'],
            DeleteItemDict
    ))

    print(response)
    
    try:
        s3 = boto3.client('s3', endpoint_url='https://s3.ca-central-1.amazonaws.com')
        s3.delete_object(Bucket='near-share-bucket', Key=data['rangeKey'])
    except:
        print("Object deletion failed: " + data['rangeKey'])
    
    return None
