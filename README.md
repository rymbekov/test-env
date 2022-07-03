![Pics.io build status](https://circleci.com/gh/TopTechPhoto/picsio.png?circle-token=ccaa9361fb1a2948cacb7e7fa8a96afafd434867)


## Preinstall
- node 8 (Please use `n` package)
- imagemagick
- grunt-cli
- kerberos (_Ubuntu: `sudo apt-get install libkrb5-dev`_)
- cpulimit
>NOTE: Don't install `cpulimit` via brew/apt-get. Build latest version from [sources](https://github.com/opsengine/cpulimit)).



## Configure development environment

Basic development environment is: `nginx`, `mongodb`, and `elasticsearch`.
Recommended way to deploy development environment is Docker Compose.

1. Install Docker
2. Optional. Install Kitematic
3. Pull mongo image by running `docker pull mongo:3.4`. We're using bare mongo container.
4. Build picsio/elasticsearch image by running:
```bash
docker build --no-cache --rm -f ./config/deploy/elasticsearch.dockerfile -t picsio/elasticsearch ./config/deploy
```
5. Build picsio/nginx image by runningn:
```bash
docker build --no-cache --rm -f ./config/deploy/nginx/nginx.dockerfile -t picsio/nginx ./config/deploy/nginx
```
To build docker image with websites config, there should be symlink to development config from

6. Now all images ready. Mongo and Elasticsearch uses host machine folders to store data. Create those folders by running 
`sudo mkdir -p -m 777 /data/mongodb && sudo mkdir -p -m 777 /data/elasticsearch`
7. Also we should create symlink to picsio to allow nginx container serve static files. Run:
`ln -s ~/projects/picsio /var/www/picsio`
8. To access pics.io we will add DNS host record to /etc/hosts by running: `echo "127.0.0.1 picsio.local" >> /etc/hosts`
9. Run via `npm run up`
10. Perform `npm i`
11. Run pics.io `npm start` (this will create database structure) and then stop process.
12. Initialize mongo replica set with preconfigured host `mongo --eval "rs.initiate({_id: 'rs-picsio', members: [{_id: 0, host: 'mongodb:27017'}]})"`
13. Add google service account as user to `picsio_dev` database: `mongo picsio_dev ./tasks/migrations/migration-3.mongo.js;`
14. Rebuild ES index `npm run es-rebuild`
15. Attach alias `images_alias` to newly created ES index: Open browser, go to `http://localhost:9200/_plugin/head/` -> Select your index -> Actions -> New Alias
16. Configure ES river plugin to replicate data from mongo to elasticsearch `curl -XPUT  'http://localhost:9200/_river/mongodb/_meta' -d '{"type": "mongodb","mongodb": {"servers": [{"host": "mongodb","port": 27017}],"db": "picsio_dev","collection": "images","options": {"skip_initial_import": false}},"index": {"name": "images_alias","type": "image", "concurrent_bulk_requests": 1}}';`
17. Sometimes river plugin is not started on creation. To check it open `http://localhost:9200/_plugin/river-mongodb/` in browser and click START button if it is present on bottom left corner. If There is only STOP button than its ok - close that page.
18. Thats it. Now run picsio(`npm start`), dev-server (`npm run dev-server`) and searcher(`npm start`)

> NOTE: When creating river configuration its important to specify mongo host EXACTLY the same as `rs.status()` command returned.
> Ex. if mongo `rs.status()` command returned `members[0].name = 'mongo-primary:27017'`, then river should specify `host:'mongo-primary`.

### API

Pics.io API server implemented to serve html and json responses on same routes. This requires client apps specify Content-Type HTTP Header to get correct response. For browser app this done by monkey patching Backbone fetch function. 

> See `app.js/extendBackbone()` function for details.

### FAQ

## Authorize AWS CLI
To perform actions with AWS, machine should be authorized to AWS API.

0. Ask for your credentials someone.
1. Install `aws-cli`. https://aws.amazon.com/ru/cli/
2. Authorize `aws-cli` with your credentials http://docs.aws.amazon.com/cli/latest/userguide/cli-chap-getting-started.html

```bash
$ aws configure
AWS Access Key ID [None]:  *PUT_ACCESSKEYID_HERE* 
AWS Secret Access Key [None]: *PUT_SECRETKEY_HERE* 
Default region name [None]: *PRESS_ENTER*
Default output format [None]: *PRESS_ENTER*
```

After that creadentials will be stored to `~/.aws/credentials` and machine will have access.

## How-to update fonts on S3
To update fonts on S3, run: `npm run deploy-assets-s3`

## How-to access to mongo/elasticsearch
To access mongo/elasticsearch, run: `./tasks/picsio-access.sh <mongo|mongo-stage|elastic|elastic-stage> <enable|disable>`.
This will open access for your IP address.
> When use public IP, close access when you done.



### Old manual

```
To build containers: `docker-compose build` from `./config` folder.
To run containers: `docker-compose up` from `./config` folder.

`docker-compose.yml` requires next folder on host machine allowed for Docker:

- `/data/mongodb` - for `mongodb` database files
- `/data/elasticsearch` - for `elasticsearch` index files
- `/private/var/www/picsio` - for static files served by nginx. Can be symlink to picsio repo root.

> NOTE: All node apps served by node from host machine. Will be dockerized later.
> NOTE: Nginx works as a static server and reverse proxy.

To prepare development environment
1. Build all required containers: `docker-compose build` from `./config/deploy` folder.
2. Run dockerized environment: `./tasks/up.sh` from repo root.
3. Initialize environment: `./taks/after-up.sh`.

After this to up all dev environment just run `npm run up`.


## MongoDB
Pics.io uses mongodb as main data backend. It should be run as a replica set to enable oplog collection. Elasticsearch river plugin uses it to update elasticsearch index. To run mongo in replica set mode, uncomment in config:
```
    replSet=rs-picsio
    oplogSize=1024
```

Then in `mongo` shell run:
```
    rs.initiate()
    rs.status()
```

Sometimes replica set is not initialized properly. Next link shows how to create replicaset and fix primary node.
https://groups.google.com/forum/#!topic/mongodb-user/rg8c_qqNLG0

## Elasticsearch
Pics.io uses Elasticsearch as a search backend for assets. Despite (warnings)[https://www.elastic.co/blog/deprecating-rivers] we use river plugin to sync data between mongo and elasticsearch.

We're using Elasticsearch 1.7, because it allows using river plugin.
Next plugins are required: 
```
cd /usr/share/elasticsearch
&& bin/plugin --install mobz/elasticsearch-head
&& bin/plugin --install lmenezes/elasticsearch-kopf
&& bin/plugin --install elasticsearch/elasticsearch-analysis-icu/2.7.0
&& bin/plugin --install elasticsearch/elasticsearch-mapper-attachments/2.7.1
&& bin/plugin --install com.github.richardwilly98.elasticsearch/elasticsearch-river-mongodb/2.0.11
&&
```

After this we can restart elasticsearch by run `sudo /etc/init.d/elasticsearch restart`. Plugins server web interfaces:

- (River web admin)[http://localhost:9200/_plugin/river-mongodb/]
- (Head web admin)[http://localhost:9200/_plugin/head/]
- (Kopf web admin)[http://localhost:9200/_plugin/kopf/]

River plugin is required to autoindex data that comes to mongodb.
To configure river, we need to create its configuration index:
```
curl -XPUT  'http://localhost:9200/_river/mongodb/_meta' -d '{"type": "mongodb","mongodb": {"servers": [{"host": "mongo-primary","port": 27017}],"db": "picsio","collection": "images","options": {"skip_initial_import": true}},"index": {"name": "images_alias","type": "image"}}'
```

To run in container environment:
```
curl -XPUT  'http://localhost:9200/_river/mongodb/_meta' -d '{"type": "mongodb","mongodb": {"servers": [{"host": "mongodb","port": 27017}],"db": "picsio_dev","collection": "images","options": {"skip_initial_import": true}},"index": {"name": "images_alias","type": "image"}}'
```

NOTE: We are using `images_alias` elasticsearch index alias to avoid downtimes when updating indices.
```

## nginx with http2 support
1. lsb_release -a // to get ubuntu release name, ex. 'vivid'
2. 2. nginx -v // to get current nginx version
3. cp /etc/nginx/nginx.conf /etc/nginx/nginx.conf.bak // backup config
4. cd /tmp/ && wget http://nginx.org/keys/nginx_signing.key // download nginx key
5. apt-key add nginx_signing.key // install key
6. nano /etc/apt/sources.list.d/nginx.list // open sources list

7. put lines with correct release name to list (vivid)
```
deb http://nginx.org/packages/mainline/ubuntu/ vivid nginx
deb-src http://nginx.org/packages/mainline/ubuntu/ vivid nginx
```

8. apt-get update && apt-get install nginx
if installer fails with error about access to some files, then run with path he said about
9. dpkg -i --force-overwrite /var/cache/apt/archives/nginx_1.9.13-1~trusty_amd64.deb
10. then go to your nginx configs and enable http2 by updating listen directive
11. reload nginx config

## Code linting
Add ESLint as default linter to project. Folder `app` contains its own `.eslintrc.json` file for backend lintimg. To use with Sublime text https://github.com/roadhump/SublimeLinter-eslint


## Tasks
- `grunt new:component:<Component-Name>` — create empty scaffolded component
- `grunt build:themes` — rebuild all pics.io themes
- `npm run [picsio|admin|monq]` — start one of apps
- `npm run es-rebuil` — rebuild ES search index
- `npm run dev-server-https` — start main app with https (see "Create local SSL certificates" section)


## Deploy:
To deploy one of products run deploy script.
`./deploy.sh app environment [branchname] [tagname]`

__app__ is required. Specifies app name to deploy. Should be one of: (_picsio, raw, edit, live_)
__environment__ is required. Specifies environment name to deploy. Should be one of: (_stage, production_)
__branchname__ is optional and depends of previous two params. Specifies branch that will be used during deploy. If ommited default branch for specified environment and product will be used. If __branchname__ is _tag_ then __tagname__ param will be used as a repo tag to deploy from.

Default branches (if __branchname__ param is omitted):

| app/enviromnent | picsio | raw | edit | live |
| --------------- | ------ | --- | ---- | ---- |
| stage           | master | master | master | master |
| production      | release-picsio | release-raw | release-edit | release-live |

Each deploy to production environment will create tag in git repo (https://github.com/TopTechPhoto/picsio/tags). We can use these tags to deploy/rollback application to concrete versions.

To deploy latest picsio to production:
```./deploy.sh picsio production``` __release-picsio__ branch will be used to deploy.

To deploy latest raw to stage:
```./deploy.sh raw stage``` __master__ branch will be used to deploy.

To deploy edit to stage from custom branch:
```./deploy.sh edit stage branch123``` __branch123__ branch will be used to deploy.



To deploy picsio to production from specified tag:
`./deploy.sh picsio production tag picsio.20151020-1234` tag __picsio.20151020-1719__ will be used to deploy.



## AWS CLI
1. Install `aws-cli` https://aws.amazon.com/ru/cli/
2. Authorize `aws-cli` with own keys http://docs.aws.amazon.com/cli/latest/userguide/cli-chap-getting-started.html
```bash
$ aws configure
AWS Access Key ID [None]:  *PUT_KEYID_HERE* 
AWS Secret Access Key [None]: *PUT_SECRETKEY_HERE* 
Default region name [None]: us-east-1
Default output format [None]: *PRESS_ENTER*
```

After that you will be aws-cli will be authorized to access AWS API.
3. Deploy fonts to S3/CloudFront: `npm run deploy-assets-s3`

4. To enable access to mongo/es for your machine IP: `./picsio-access.sh <mongo|mongo-stage|elastic|elastic-stage> <enable|disable>`


## SLOC

To calculate SLOC
```bash
cd /Users/yeti/Developer/Projects/picsio/src && git ls-files | grep -e 'app/' -e 'config/' -e 'tasks/' -e 'static/assets/' -e 'static/tests/'| grep -v -e 'lib/' -e 'libs/' -e 'vendor/' -e 'node_modules'| egrep '\.js$|\.css$|\.html$|\.pug$|\.fs$|\.vs$|\.sh$|\.htaccess$' | xargs cat | wc -l
```

## Update SSL certificates

To update SSL certificate we have to do this at:
- Production instance
- Stage instance
- Services instance that provides public pages/links (eg. `zipper`)
- CloudFront

### Update SSL certificates on instances

SSL certificates located in `/etc/nginx/keys/wildcard/{{yearIssuesAt}}` folders. Example:

```
> cd /etc/nginx/keys/wildcard
> ls -lah
total 28K
drwxr-xr-x 6 root root 4.0K .
drwxr-xr-x 7 root root 4.0K ..
drwxr-xr-x 2 root root 4.0K 2014
drwxr-xr-x 2 root root 4.0K 2015
drwxr-xr-x 2 root root 4.0K 2016
drwxr-xr-x 2 root root 4.0K 2017
lrwxrwxrwx 1 root root   29 STAR_picsio.chained.crt -> ./2017/picsio2017.chained.crt
lrwxrwxrwx 1 root root   21 wildcard.picsio.csr -> ./2017/picsio2017.csr
lrwxrwxrwx 1 root root   21 wildcard.picsio.key -> ./2017/picsio2017.key
```

`nginx` points to those symlinks. To renew certificate:
1. Create new year-folder with files `mkdir /etc/nginx/keys/wildcard/2022`
2. Recreate symlynks `ln -nsf /etc/nginx/keys/wildcard/2022/picsio.key /etc/nginx/keys/wildcard/wildcard.picsio.key`.

## Use local SSL certificates

https://www.freecodecamp.org/news/how-to-get-https-working-on-your-local-development-environment-in-5-minutes-7af615770eec/

All needed files in the `./certificates` folder;

Need just **Step 2: Trust the root SSL certificate** from post above


