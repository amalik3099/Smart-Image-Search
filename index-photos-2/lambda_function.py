import json
import urllib.parse
import boto3
import urllib3
import datetime
from botocore.exceptions import ClientError

TABLENAME = 'photos'
TYPE = 'photo'
OPENSEARCH_ENDPOINT = "https://search-photos-trnawv4th6cxgbgpexgmnprnxy.us-east-1.es.amazonaws.com"
REGION = "us-east-1"
master_username = 'master'
master_password = 'PeterParker#2022'
headers = { "Content-Type": "application/json" }
print('Loading function')

s3 = boto3.client('s3')
print("THIS SHOWS A LAMBDA CHANGE!!!!)

def detect_labels(photo, bucket):

    client=boto3.client('rekognition')

    response = client.detect_labels(Image={'S3Object':{'Bucket':bucket,'Name':photo}},
        MaxLabels=30, MinConfidence=98)

    print('Detected labels for ' + photo) 
    print()
    label_set = set()
    for label in response['Labels']:
        print ("Label: " + label['Name'])
        label_set.add(label["Name"].lower())
        label_set.add(label["Name"].lower()+'s')
    
    meta_response = s3.head_object(Bucket=bucket, Key=photo)
    print("Meta Response", meta_response)
    if "Metadata" in meta_response and "customlabels" in meta_response["Metadata"]:
        label_set = label_set | set(meta_response["Metadata"]['customlabels'].lower().split(", "))
    
    print("This is the label set:", label_set)
    
    return label_set


def lambda_handler(event, context):
    # print("Received event: " + json.dumps(event, indent=2))
    # Get the object from the event and show its content type
    bucket = event['Records'][0]['s3']['bucket']['name']
    key = urllib.parse.unquote_plus(event['Records'][0]['s3']['object']['key'])
    try:
        labels = detect_labels(key, bucket)
        print(labels)
        
        # indexing image as json in Open Search
        opensearch_client = {
            "objectKey": key, 
            "bucket": bucket,
            "createdTimestamp": str(datetime.datetime.now().strftime("%Y-%m-%d"'T'"%H:%M:%S")),
            "labels": list(labels)
        }
        
        http = urllib3.PoolManager()
        url = "%s/%s/%s/" % (OPENSEARCH_ENDPOINT, TABLENAME, TYPE)
        
        headers = urllib3.make_headers(basic_auth='%s:%s' % (master_username, master_password))
        headers.update({
            'Content-Type': 'application/json',
            "Accept": "application/json"
        })
        
        photos_json = opensearch_client
        response = http.request('POST', url, headers=headers, body=json.dumps(photos_json))
        status = response.status
        data = json.loads(response.data)
        print("ES Response: [%s] %s" % (status, data))
        
    except Exception as e:
        print(e)
        print('Error getting object {} from bucket {}. Make sure they exist and your bucket is in the same region as this function.'.format(key, bucket))
        raise e

