'use strict';

var Alexa = require('alexa-sdk');
var EdmundsClient = require('node-edmunds-api');
// var client = new EdmundsClient({apiKey: 'wrrrpf9768ruhydu8qdj38ay'});
var client = new EdmundsClient({apiKey: 'n59dbx45rdxtnqgwg68qn8px'}); //temp
var APP_ID = 'amzn1.ask.skill.f36c7733-77d8-46a4-b62c-40b85e4ea617'; //OPTIONAL: replace with 'amzn1.echo-sdk-ams.app.[your-unique-value-here]';
var SKILL_NAME = 'Fuel Me';

exports.handler = function(event, context, callback) {
    var alexa = Alexa.handler(event, context);
    alexa.APP_ID = APP_ID;
    alexa.registerHandlers(handlers);
    alexa.execute();
};

var handlers = {
    'LaunchRequest': function () {
        console.log("went in newsession function");

        // If the user either does not reply to the welcome message or says something that is not
        // understood, they will be prompted again with this text.
        this.attributes['speechOutput'] = 'Welcome to ' + SKILL_NAME + '. Please tell me a car make, model, and year that you would like to know the miles per gallon of.';
        this.attributes['repromptSpeech'] = 'To find the miles per gallon of a car, say something like: what is the miles per gallon for a Honda Accord 2015?';
        this.emit(':ask', this.attributes['speechOutput'], this.attributes['repromptSpeech'])
    },
    'GetMPG': function () {
        console.log("went in getmpg function");
        console.log("this.event.request.intent.slots.MakeModel.value: " + this.event.request.intent.slots.MakeModel.value);
        console.log("this.event.request.intent.slots.Year.value: " + this.event.request.intent.slots.Year.value);
        var self = this;
        if(this.event.request.intent.slots.MakeModel.value != undefined && this.event.request.intent.slots.Year.value != undefined){   
            var input = this.event.request.intent.slots.MakeModel.value.split(" ");    
            var params = {};
            params.make = input[0];
            params.model = input[1];
            console.log("params.make: " + params.make + ",params.model: " + params.model);
            params.year = this.event.request.intent.slots.Year.value;
            params.view = "full";
            client.getStyleDetailsByMakeModelYear(params, function onResponse(err, res) {
                console.log("err: "+err);
                if(err != null){
                    console.log("car details retrieval problem logic");
                    self.emit('Unhandled');
                }
                else{
                    if(res == undefined || res.stylesCount == 0){
                        console.log("car details processing problem logic");
                        self.emit('Unhandled');
                    }
                    else{
                        console.log("res: "+JSON.stringify(res));
                        var cityMPG = res.styles[0].MPG.city;
                        var hwyMPG = res.styles[0].MPG.highway;
                        console.log("MPG city/highway: "+cityMPG+"/"+hwyMPG);
                        self.emit(':tell',"A " + params.make + " " + params.model + " " + params.year + " has a fuel economy of " + cityMPG + " miles per gallon in the city and " + hwyMPG + " on the highway.");
                    }
                }
            });
        }
        else if(this.event.request.intent.slots.MakeModel.value != undefined || this.event.request.intent.slots.Year.value != undefined){
                console.log("car details undefined logic");
                this.emit('Unhandled');
        }
        else if(this.event.request.intent.slots.MakeModel.value == "help" && this.event.request.intent.slots.Year.value == "help"){
                console.log("help if logic");
                this.attributes['speechOutput'] = 'You can ask a question like: what is the miles per gallon for a Chevrolet Silverado 2015? Please tell me a car that you would like to know the miles per gallon of.';
                this.attributes['repromptSpeech'] = 'You can ask a question like: what is the miles per gallon for a Chevrolet Silverado 2015? Please tell me a car that you would like to know the miles per gallon of.';
                this.emit(':ask', this.attributes['speechOutput'], this.attributes['repromptSpeech'])
        }
        else{
          // If the user either does not reply to the welcome message or says something that is not
          // understood, they will be prompted again with this text.
          this.attributes['speechOutput'] = 'Welcome to ' + SKILL_NAME + '. You can ask a question like, what is the miles per gallon for a Honda Civic 2015?';
          this.attributes['repromptSpeech'] = 'To find a fuel economy, say something like: what is the miles per gallon for a Honda Civic 2015?';
          this.emit(':ask', this.attributes['speechOutput'], this.attributes['repromptSpeech'])
        }
    },
    'AMAZON.HelpIntent': function() {
        console.log("went in Amazon.HelpIntent");
        // If the user either does not reply to the welcome message or says something that is not
        // understood, they will be prompted again with this text.
        this.attributes['speechOutput'] = 'You can ask a question like, what is the fuel economy of a Chevrolet Camaro 2010? Please tell me a car you would like to find the fuel economy of.';
        this.attributes['repromptSpeech'] = 'You can ask a question like, what is the fuel economy of a Chevrolet Camaro 2010? Please tell me a car you would like to find the fuel economy of.';
        this.emit(':ask', this.attributes['speechOutput'], this.attributes['repromptSpeech'])
    },
    'AMAZON.StopIntent': function () {
        this.emit('SessionEndedRequest');
    },
    'AMAZON.CancelIntent': function () {
        this.emit('SessionEndedRequest');
    },
    'SessionEndedRequest':function () {
        this.emit(':tell', 'Goodbye!');
    },
    'Unhandled': function() {
        this.emit(':tell', 'Sorry, I was unable to understand and process your request. Please try again.');
        this.emit('SessionEndedRequest');
    }
};
