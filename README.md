# We Are the Federation Events Map

Ran using `npm 5.0.1`

# Development Setup

```
npm install
npm install --save-dev
```

To run gulp:

    $ gulp

Local site is at http://localhost:8000/


# Export

You will need the following Environment Variables set

| EnvVar | Description |
|- |- |
| AWS_ACCESS_KEY | Access Key for AWS |
| AWS_SECRET_KEY | Secret Key for AWS S3 bucket |
| AWS_BUCKET_NAME | Bucket name for the AWS Bucket |
| AWS_REGION | Region for the AWS s3 Bucket|
| CLOUDFRONT_ID | Distribution ID for your cloudfront instance |

To export:

```
  $ gulp publish
```

Contact:

* Rapi Castillo – rapicastillo.work@gmail.com

<a href='https://actionnetwork.org/events/new?event_campaign_id=4324' target='_blank' class='btn btn-primary'>
  <img src='/img/wm-icon.png' class='wm-icon' /> Host an Event
</a>
