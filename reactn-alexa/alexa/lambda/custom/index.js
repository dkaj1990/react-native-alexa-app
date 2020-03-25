/* eslint-disable  func-names */
/* eslint-disable  no-console */

const Alexa = require('ask-sdk');
const dbHelper = require('./helpers/dbHelper');
const GENERAL_REPROMPT = "What would you like to do?";
const dynamoDBTableName = "PTRDocs-37cc5vbppngc5hzz6znwmsp3yq-test";



const LaunchRequestHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'LaunchRequest';
  },
  handle(handlerInput) {
    const speechText = 'Hello, Welcome to Track It. Which important document would you like to track?';
    const repromptText = ' You can say add or remove document. For example, say, add my passport or list all my documents. ';

    return handlerInput.responseBuilder
      .speak(speechText)
      .reprompt(repromptText)
      .getResponse();
  },
};

const InProgressAddDocumentIntentHandler = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    return request.type === 'IntentRequest' &&
      request.intent.name === 'AddDocumentIntent' &&
      request.dialogState !== 'COMPLETED';
  },
  handle(handlerInput) {
    const currentIntent = handlerInput.requestEnvelope.request.intent;
    return handlerInput.responseBuilder
      .addDelegateDirective(currentIntent)
      .getResponse();
  }
}

const AddDocumentIntentHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && handlerInput.requestEnvelope.request.intent.name === 'AddDocumentIntent';
  },
  async handle(handlerInput) {
    const {responseBuilder } = handlerInput;
    const id = handlerInput.requestEnvelope.context.System.user.userId; 
    const slots = handlerInput.requestEnvelope.request.intent.slots;
    const documentName = slots.DocumentName.value;
    const description = 'default';
    const expDate = slots.ExpDate.value|| 'default';
    const remDate = 'default';
    return dbHelper.addDocument(documentName, id, description, expDate, remDate)
      .then((data) => {
        const speechText = `You have added document ${documentName} with expiration date of ${expDate}. You can say add to add another one or remove to remove document`;
        return responseBuilder
          .speak(speechText)
          .reprompt(GENERAL_REPROMPT)
          .getResponse();
      })
      .catch((err) => {
        console.log("Error occured while saving document", err);
        const speechText = "we cannot save your document right now. Try again!"
        return responseBuilder
          .speak(speechText)
          .getResponse();
      })
  },
}; 

const GetDocumentsIntentHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && handlerInput.requestEnvelope.request.intent.name === 'GetDocumentsIntent';
  },
  async handle(handlerInput) {
    const {responseBuilder } = handlerInput;
    const userID = handlerInput.requestEnvelope.context.System.user.userId; 
    console.log(userID);
    return dbHelper.getDocuments(userID)
      .then((data) => {
        var speechText = "Your documents are "
        if (data.length == 0) {
          speechText = "You do not have any documents stored yet, add it by saying add document "
        } else {
          speechText += data.map(e => e.title + 'with expiration date of <say-as interpret-as="date">' +  e.expDate + '</say-as>').join(", ")
        }
        return responseBuilder
          .speak(speechText)
          .reprompt(GENERAL_REPROMPT)
          .getResponse();
      })
      .catch((err) => {
        const speechText = "we cannot get your document right now. Try again!"
        return responseBuilder
          .speak(speechText)
          .getResponse();
      })
  }
}

const GetDocumentsByTitleIntentHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && handlerInput.requestEnvelope.request.intent.name === 'GetDocumentsByTitleIntent';
  },
  async handle(handlerInput) {
    const {responseBuilder } = handlerInput;
    const userID = handlerInput.requestEnvelope.context.System.user.userId; 
    const slots = handlerInput.requestEnvelope.request.intent.slots;
    const documentName = slots.DocumentName.value;
    console.log(userID);
    return dbHelper.getDocumentsByTitle(documentName, userID)
      .then((data) => {
        var speechText = "Your "
        if (data.length == 0) {
          speechText = `You do not have any documents stored with name ${documentName}, add it by saying add document `
        } else {
          speechText += data.map(e => e.title + 'expires on <say-as interpret-as="date">' + e.expDate + '</say-as>').join(", ")
        }
        return responseBuilder
          .speak(speechText)
          .reprompt(GENERAL_REPROMPT)
          .getResponse();
      })
      .catch((err) => {
        const speechText = "we cannot get your document right now. Try again!"
        return responseBuilder
          .speak(speechText)
          .getResponse();
      })
  }
}

/* const InProgressRemoveDocumentIntentHandler = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    return request.type === 'IntentRequest' &&
      request.intent.name === 'RemoveDocumentIntent' &&
      request.dialogState !== 'COMPLETED';
  },
  handle(handlerInput) {
    const currentIntent = handlerInput.requestEnvelope.request.intent;
    return handlerInput.responseBuilder
      .addDelegateDirective(currentIntent)
      .getResponse();
  }
}

const RemoveDocumentIntentHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && handlerInput.requestEnvelope.request.intent.name === 'RemoveDocumentIntent';
  }, 
  handle(handlerInput) {
    const {responseBuilder } = handlerInput;
    const userID = handlerInput.requestEnvelope.context.System.user.userId; 
    const slots = handlerInput.requestEnvelope.request.intent.slots;
    const documentName = slots.DocumentName.value;
    return dbHelper.removeDocument(documentName, userID)
      .then((data) => {
        const speechText = `You have removed document with name ${documentName}, you can add another one by saying add`
        return responseBuilder
          .speak(speechText)
          .reprompt(GENERAL_REPROMPT)
          .getResponse();
      })
      .catch((err) => {
        const speechText = `You do not have document with name ${documentName}, you can add it by saying add`
        return responseBuilder
          .speak(speechText)
          .reprompt(GENERAL_REPROMPT)
          .getResponse();
      })
  }
} */

const ProactiveEventHandler = {
  canHandle(handlerInput) {
    console.log(handlerInput);
    return handlerInput.requestEnvelope.request.type === 'AlexaSkillEvent.ProactiveSubscriptionChanged'
  },
  handle(handlerInput) {
    console.log("AWS User " + handlerInput.requestEnvelope.context.System.user.userId);
    console.log("API Endpoint " + handlerInput.requestEnvelope.context.System.apiEndpoint);
    console.log("Permissions" + JSON.stringify(handlerInput.requestEnvelope.request.body.subscriptions));
    const speechText = 'Hello, one of your important documents is about to expire soon. Please go to your track it app for more information.  ';
    const repromptText = 'Would you like to hear the notification again?';

    return handlerInput.responseBuilder
      .speak(speechText)
      .reprompt(repromptText)
      .getResponse();
  },
}

const HelpIntentHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && handlerInput.requestEnvelope.request.intent.name === 'AMAZON.HelpIntent';
  },
  handle(handlerInput) {
    const speechText = 'You can introduce yourself by telling me your name';

    return handlerInput.responseBuilder
      .speak(speechText)
      .reprompt(speechText)
      .getResponse();
  },
};

const CancelAndStopIntentHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && (handlerInput.requestEnvelope.request.intent.name === 'AMAZON.CancelIntent'
        || handlerInput.requestEnvelope.request.intent.name === 'AMAZON.StopIntent');
  },
  handle(handlerInput) {
    const speechText = 'Goodbye!';

    return handlerInput.responseBuilder
      .speak(speechText)
      .getResponse();
  },
};

const SessionEndedRequestHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'SessionEndedRequest';
  },
  handle(handlerInput) {
    console.log(`Session ended with reason: ${handlerInput.requestEnvelope.request.reason}`);

    return handlerInput.responseBuilder.getResponse();
  },
};

const ErrorHandler = {
  canHandle() {
    return true;
  },
  handle(handlerInput, error) {
    console.log(`Error handled: ${error.message}`);

    return handlerInput.responseBuilder
      .speak('Sorry, I can\'t understand the command. Please say again.')
      .reprompt('Sorry, I can\'t understand the command. Please say again.')
      .getResponse();
  },
};

const skillBuilder = Alexa.SkillBuilders.standard();

exports.handler = skillBuilder
  .addRequestHandlers(
    LaunchRequestHandler,
    InProgressAddDocumentIntentHandler,
    AddDocumentIntentHandler,
    GetDocumentsIntentHandler,
    GetDocumentsByTitleIntentHandler,
    //InProgressRemoveDocumentIntentHandler,
    //RemoveDocumentIntentHandler,
    ProactiveEventHandler,
    HelpIntentHandler,
    CancelAndStopIntentHandler,
    SessionEndedRequestHandler
  )
  .addErrorHandlers(ErrorHandler)
  .withTableName(dynamoDBTableName)
  .withAutoCreateTable(true)
  .lambda();
