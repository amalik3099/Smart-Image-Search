import json
import urllib.parse
import boto3
import datetime
import urllib3

TABLENAME = 'photos'
TYPE = '_search'
OPENSEARCH_ENDPOINT = "https://search-photos-trnawv4th6cxgbgpexgmnprnxy.us-east-1.es.amazonaws.com"
REGION = "us-east-1"
master_username = 'master'
master_password = 'PeterParker#2022'
headers = { "Content-Type": "application/json" }
print('Loading function')


def lambda_handler(event, context):
    client = boto3.client('lex-runtime')
    
    print("*"*10)
    print(event)
    print("*"*10)

    response = client.post_text(
        botName='searchPhotos',
        botAlias='search_bot',
        userId='testUser',
        # inputText=event["queryStringParameters"]["q"]
        inputText="search photos of dog"
    )
    
    print("This is response", response)
    
    if "slots" not in response:
        return {
            'statusCode': 200,
            'headers': {
                "Access-Control-Allow-Origin": "*",
                'Content-Type': 'application/json'
            },
            'body': "Error: No query received"
        }
    print(response["slots"])

    http = urllib3.PoolManager()
    url = "%s/%s/%s/" % (OPENSEARCH_ENDPOINT, TABLENAME, TYPE)

    headers = urllib3.make_headers(basic_auth='%s:%s' % (master_username, master_password))
    headers.update({
        'Content-Type': 'application/json',
        "Accept": "application/json"
    })

    query = {
        "query": {
            "query_string": {
                "query": f"(labels:{response['slots']['slotOne']} OR labels:{response['slots']['slotTwo']})"
            }
        }
    }

    request = http.request('GET', url, headers=headers, body=json.dumps(query))
    status = request.status
    data = json.loads(request.data)
    print("ES Response: [%s] %s" % (status, data))

    photo_set = set()
    for photo in data["hits"]["hits"]:
        print(photo['_source']['objectKey'])
        photo_set.add('https://octavius-photos.s3.amazonaws.com/' + photo['_source']['objectKey'])
    photo_set = list(photo_set)

    if not photo_set:
        photo_set = "No images exist for this query."

    return {
        'statusCode': 200,
        'headers': {
            "Access-Control-Allow-Origin": "*",
            'Content-Type': 'application/json'
        },
        'body': json.dumps(photo_set)
    }

