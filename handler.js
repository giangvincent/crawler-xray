/**
 * Main js fncs for xray crawler tool
 * @type {[type]}
 */
const express = require('express');
const serverless = require('serverless-http')
const bodyParser = require('body-parser')
const fs = require('fs');
const Xray = require('x-ray');
const xray = Xray();
const app = express()

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

/**
 * handle url /crawl?url=[url]
 * @param  {req.query.url} get query parameter by url, this should be a valid url from database
 * @param {req.query.json} get query parameter by json, this should be a valid url of json file for the rule
 * @return {json object} result from crawler x-ray after crawl the url || null
 */
app.get('/crawl', (req, res) => {
    // url need to crawl
    var url = req.query.url;
    // file json of the crawl json rule
    var file = req.query.json;
    // result from x-ray crawl
    var ret = {};
    // obj : data json from file reader
    var obj;
    // init xray for url
    /*xray('http://google.com', 'title')(function(err, title) {
    	ret.title = title
    	fs.readFile(file, 'utf8', function (err, data) {
    		if (err) throw err;
    		obj = JSON.parse(data);
    	});
      	res.status(200).send({success:true , res: ret})
    })*/
    xray('https://dribbble.com', 'li.group', [{
            title: '.dribbble-img strong',
            image: '.dribbble-img img@src',
        }])
        .paginate('.next_page@href')
        .limit(1)
        .then(function(ret) {
            res.status(200).send({ success: true, res: ret })
            //console.log(res[0]) // prints first result
        })
        .catch(function(err) {
            console.log(err) // handle error in promise
        })

});

// Handle in-valid route
app.all('*', function(req, res) {
    const response = { data: null, message: 'Route not found!!' }
    res.status(400).send(response)
})

// wrap express app instance with serverless http function
module.exports.handler = serverless(app)