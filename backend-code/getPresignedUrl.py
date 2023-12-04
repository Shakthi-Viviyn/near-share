import json
import boto3
from botocore.client import Config

dynamodb = boto3.client('dynamodb', region_name='ca-central-1')

def lambda_handler(event, context):
    
    print(event)
    
    body = json.loads(event['body'])
    
    response = dynamodb.query(
        TableName='near-share-object-table',
        IndexName='uploadQuota-index',
        ExpressionAttributeValues={
            ':v1': {
                'S': body['ownerId'],
            },
        },
        KeyConditionExpression='ownerId = :v1',
        Select='COUNT'
    )
    
    print(response)

    if (response['Count'] >= 5):
        print("User reached the limit")
        return {
            "statusCode": 400,
            "body": json.dumps({
                "message": "5 files can be live at a time"
            })
        }


    s3 = boto3.client('s3',
                    config=Config(signature_version='s3v4'),
                    endpoint_url='https://s3.ca-central-1.amazonaws.com')

    expirationTime = 1000
    try:
        response = s3.generate_presigned_url('put_object',
                                                Params={
                                                    'Bucket': "near-share-bucket",
                                                    'Key': body['fileName'],
                                                    'Metadata': {
                                                        'originalName': body['fileName'],
                                                        'longitude': body['longitude'],
                                                        'latitude': body['latitude'],
                                                        'ownerId': body['ownerId'],
                                                        'expiryDuration': body['expiryDuration']
                                                     }
                                                },
                                            ExpiresIn=expirationTime
                                            )
        return {
            "statusCode": 200,
            "body": json.dumps({
                "uploadUrl": response,
                "expiresIn": expirationTime
            })
        }
    except:
        print("Error generating presigned url")
        return {
            "statusCode": 500,
            "body": json.dumps({
                "message": "Error generating presigned url"
            })
        }

    
