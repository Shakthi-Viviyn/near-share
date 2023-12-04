import boto3
import uuid
import json
import dynamodbgeo

def lambda_handler(event, context):
    
    print(event)
    
    dynamodb = boto3.client('dynamodb', region_name='ca-central-1')
    config = dynamodbgeo.GeoDataManagerConfiguration(dynamodb, 'near-share-object-table')
    config.hashKeyLength = 10
    geoDataManager = dynamodbgeo.GeoDataManager(config)
    
    body = json.loads(event['body'])
    print(body)
    
    latitude = body['latitude']
    longitude = body['longitude']
    
    try:
        query_result = geoDataManager.queryRadius(
        dynamodbgeo.QueryRadiusRequest(
            dynamodbgeo.GeoPoint(latitude, longitude), # center point
            75, # radius
            sort=True
            )
        )
        print(query_result)
     
        keys_to_keep = ['originalName', 'rangeKey', 'geoJson', 'url']
            
        def parse_dynamodb_result(query_result):
            result = []
            for item in query_result:
                result.append({k: list(v.values())[0] for k, v in item.items() if k in keys_to_keep})
            return result
            
        query_result = parse_dynamodb_result(query_result)
        
        return {
            'statusCode': 200,
            'body': json.dumps(query_result)
        }
        
    except e:
        
        print(e)
        
        return {
            'statusCode': 500,
            'body': json.dumps({
                'message': "Error fetching nearby objects"
            })
        }
    
