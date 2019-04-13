/**
 * Main js fncs for xray crawler tool
 * @type {[type]}
 */
const express = require('express');
const request = require('request');
const serverless = require('serverless-http')
const bodyParser = require('body-parser')
const fs = require('fs');
const Xray = require('x-ray');
const xray = Xray();
const app = express()

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

/**
 * handle url /crawl?url=[url]&json=[/upload/rules/1.json]
 * @param  {req.query.url} get query parameter by url, this should be a valid url from database
 * @param {req.query.json} get query parameter by json, this should be a valid url of json file for the rule
 * @return {json object} result from crawler x-ray after crawl the url || null
 */
app.get('/crawl', (req, res) => {
    // url need to crawl
    var urlCrawl = decodeURIComponent(req.query.url);
    // file json of the crawl json rule
    var file = decodeURIComponent(req.query.json);
    //var temp_file = './1.json';
    if (urlCrawl != null & urlCrawl != 'undefined' && file != null & file != 'undefined' ) {
        var data_file;
        request.get(file , function (error, response, body) {
            if (!error && response.statusCode == 200) {
                data_file = JSON.parse(body);
                //res.status(200).send({success:true , res: data_file})
                var ret = [];
                var num_push = 0;
                for (var i = data_file.list.length - 1; i >= 0; i--) {
                    //console.log(data_file.list[i])
                    xray(urlCrawl, data_file.list[i].list_element, [{
                        title: data_file.list[i].title_filter,
                        link: data_file.list[i].link_filter,
                        image: data_file.list[i].cover_filter,
                        description: xray(data_file.list[i].link_filter, data_file.detail.description),
                        content: xray(data_file.list[i].link_filter, data_file.detail.content)
                    }])
                    .then(function (data) {
                        num_push++;
                        for(var d of data){
                            ret.push(d)
                        }
                        
                        console.log(data.length)
                        if (num_push == data_file.list.length) {
                            var stream = fs.createWriteStream("test.json");
                            stream.once('open', function(fd) {

                                stream.write(JSON.stringify(ret));
                                stream.end();
                            });
                            res.status(200).header('Access-Control-Allow-Origin', '*').send({ success: true })
                        }
                    })
                    .catch(function (err) {
                        console.log(err)
                    })
                } 
            } else throw error;

        });
    } else {
        res.status(200).header('Access-Control-Allow-Origin', '*').send({success:false , res: 'Can not find the Json file'})
    }
        
    
    /*// result from x-ray crawl
    var ret = {};
    // obj : data json from file reader
    var obj;
    // init xray for url
    xray('http://google.com', 'title')(function(err, title) {
    	ret.title = title
    	fs.readFile(file, 'utf8', function (err, data) {
    		if (err) throw err;
    		obj = JSON.parse(data);
    	});
      	res.status(200).send({success:true , res: ret})
    })
    xray('https://vnexpress.net/so-hoa', 'section', [{
            link: 'div.side_featured > article > div.thumb_big > a@href',
            //image: 'div.side_featured > article > div.thumb_big > img.lazyloaded@data-original',
        }])
        .paginate('.next_page@href')
        .limit(1)
        .then(function(ret) {
            var temp_res = [];
            for (var i = ret.length - 1; i >= 0; i--) {
                if(typeof ret[i]['image'] != 'undefined')
                    temp_res.push(ret[i])
            }
            res.status(200).send({ success: true, res: ret })
            //console.log(res[0]) // prints first result
        })
        .catch(function(err) {
            console.log(err) // handle error in promise
        })*/

});

app.get('/test-url' , (req , res) => {
    res.status(200).send({success:true});
})

// Handle in-valid route
app.all('*', function(req, res) {
    const response = { data: null, message: 'Route not found!!' }
    res.status(400).send(response)
})

// wrap express app instance with serverless http function
module.exports.handler = serverless(app)