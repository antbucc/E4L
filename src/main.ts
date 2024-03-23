/// <reference types="@workadventure/iframe-api-typings" />

import { bootstrapExtra } from '@workadventure/scripting-api-extra';
import { AxiosResponse } from 'axios';
import { API, PolyglotNodeValidation } from './data/api';

//problema da discutere:
//la webapp è definita affinché se non devi cambiare piattaforma ti tiene lì
//quindi definirei un'area unica per l'accesso alla WebApp
//suddividendo le altre per attività esterne all'app
//tipo miroboard, coding, ecc

console.log('Script started successfully');
console.log('Tmaooooo ' + WA.room);
let ctx: string; //to be remove after becoming obsolete, global ctx to keep tracks of this execution

// Define TypeScript interface for the API response
interface ApiResponse {
  // Define the properties based on the actual structure of the API response
  // Example properties, replace them with actual properties from the API response
  nextActivity: {
    type: string;
  };
  url: string;
  // Add more properties as needed
}

function nextActivityBanner(type: string, ){
  WA.ui.banner.openBanner({
    id: 'NextBanner',
    text: 'Your next activity is "'+type+'", go to the correct area.',
    bgColor: '#000000',
    textColor: '#ffffff',
    closable: true,
    timeToClose: 120000,
  });
}

async function getActualActivity(): Promise<PolyglotNodeValidation> {
  try {
    if (!ctx) throw 'No ctx detected';
    const response: AxiosResponse = await API.getActualNode({ ctxId: ctx });
    if (response.status != 200) {
      console.error('Error:', response.status, response.statusText);
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    return response.data;
  } catch (error) {
    // Handle network errors or other exceptions
    console.error('Error:', error);
    throw error; // Rethrow the error for the caller to handle
  }
}

async function startActivity(flowId: string) {
  try {
    const response: AxiosResponse = await API.getFirstNode({ flowId });
    // Handle error responses
    if (response.status != 200) {
      console.error('Error:', response.status, response.statusText);
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    ctx = response.data.ctx;
    return response.data.type;
  } catch (error) {
    // Handle network errors or other exceptions
    console.error('Error:', error);
    throw error; // Rethrow the error for the caller to handle
  }
}

let activity1Response: ApiResponse;
let activity2Response: ApiResponse;
//let activity3Response: ApiResponse
//let activity4Response: ApiResponse

// Waiting for the API to be ready
WA.onInit()
  .then(async () => {
    console.log('Scripting API ready');
    console.log('Player tags: ', WA.player.tags);
    try {
      console.log('testing startttttttttttt');
      const exerciseType = await startActivity(
        '95316bc8-caea-486f-95ad-ba635a9608c4'
      );
      console.log('where to go', exerciseType);
      //open a timed popup to send the user to the right location
    } catch (error) {
      // Handle errors if the API call fails
      console.error('Failed to get API response:', error);
    }

    // ACTIVITY TYPE 1
    WA.room.area.onEnter('ActivityType1').subscribe(async () => {
      try {
        console.log('testing ACTIVITYTYPE1 areaaaaaaaaaaaa');
        const exerciseType = await getActualActivity();
        console.log('where to go', exerciseType);
        //open a timed popup to send the user to the right location
      } catch (error) {
        // Handle errors if the API call fails
        console.error('Failed to get API response:', error);
      }
      // You can open a website inside a modal like that:
      // WA.ui.modal.openModal({
      //     title: "Activity type 1",
      //     src: activity1Response.url,
      //     allow: "fullscreen",
      //     allowApi: true,
      //     position: "center",
      // })
    });
    WA.room.area.onLeave('ActivityType1').subscribe(() => {
      WA.ui.modal.closeModal();
    });

    // ACTIVITY TYPE 2
    WA.room.area.onEnter('ActivityType2').subscribe(async () => {
      // If you need to send data from the first call
      console.log('ctx:', ctx);
      try {
        /*activity2Response = await postDataToAPI('actual', {
          ctxId: '802110e4-1e67-4012-9b08-af6f18f82683',
        });*/
        console.log('activity2Response', activity2Response);
        // You can use activity2Response in subsequent parts of your code
      } catch (error) {
        // Handle errors if the API call fails
        console.error('Failed to get API response:', error);
      }
      const test = await getActualActivity();
      const URL =
        process.env.WEBAPP_URL +
        '/?&ctx=' +
        ctx +
        '&rememberTipologyQuiz=' +
        test.type;
      if (test.type != 'ReadMaterial') {
        console.log('wrong spot, go to another area');
        WA.ui.banner.openBanner({
          id: 'ReadMaterialBanner',
          text: 'Wrong area, here you are able to make activity connected to the WebApp',
          bgColor: '#000000',
          textColor: '#ffffff',
          closable: true,
          timeToClose: 120000,
        });
        return;
      }
      WA.ui.modal.openModal({
        title: 'Activity type 1',
        src: URL,
        allow: 'fullscreen',
        allowApi: true,
        position: 'center',
      });
      const type = activity2Response.nextActivity.type; // value could be 'Type3'
      // the value MUST match the layer name in Tiled

      WA.room.showLayer('activity/' + type);
    });

    WA.room.area.onLeave('ActivityType2').subscribe(async () => {
      const nextActivity= await getActualActivity();
      nextActivityBanner(nextActivity.type);
      WA.ui.modal.closeModal();
    });

    // ACTIVITY TYPE 3
    WA.room.area.onEnter('ActivityType3').subscribe(async () => {
      // If you need to send data from the first call
      console.log('ctx:', ctx);
      try {
        /*activity2Response = await postDataToAPI('actual', {
          ctxId: '802110e4-1e67-4012-9b08-af6f18f82683',
        });*/
        console.log('activity3Response', activity2Response);
        // You can use activity2Response in subsequent parts of your code
      } catch (error) {
        // Handle errors if the API call fails
        console.error('Failed to get API response:', error);
      }
      const test = await getActualActivity();
      const URL =
        process.env.WEBAPP_URL +
        '/?&ctx=' +
        ctx +
        '&rememberTipologyQuiz=' +
        test.type;
      if (test.type != 'MultichoiceQuestion') {
        console.log('wrong spot, go to another area');
        return;
      }
      WA.ui.banner.openBanner({
        id: 'MultichoiceQuestionBanner',
        text: 'Wrong area, here you can do multichoice question lessons',
        bgColor: '#000000',
        textColor: '#ffffff',
        closable: true,
        timeToClose: 120000,
      });
      WA.ui.modal.openModal({
        title: 'Activity type 3',
        src: URL,
        allow: 'fullscreen',
        allowApi: true,
        position: 'center',
      });
      const type = activity2Response.nextActivity.type; // value could be 'Type3'
      // the value MUST match the layer name in Tiled

      WA.room.showLayer('activity/' + type);
    });

    WA.room.area.onLeave('ActivityType3').subscribe(() => {
      WA.ui.modal.closeModal();
    });

    // ACTIVITY TYPE 4
    WA.room.area.onEnter('ActivityType4').subscribe(async () => {
      // If you need to send data from the first call
      console.log('ctx:', ctx);
      try {
        console.log('activity4Response', activity2Response);
        // You can use activity2Response in subsequent parts of your code
      } catch (error) {
        // Handle errors if the API call fails
        console.error('Failed to get API response:', error);
      }
      const test = await getActualActivity();
      const URL =
        process.env.WEBAPP_URL +
        '/?&ctx=' +
        ctx +
        '&rememberTipologyQuiz=' +
        test.type;
      if (test.type != 'OpenQuestion') {
        console.log('wrong spot, go to another area');
        WA.ui.banner.openBanner({
          id: 'OpenQuestionBanner',
          text: 'Wrong area, here you can do multichoice question lessons',
          bgColor: '#000000',
          textColor: '#ffffff',
          closable: true,
          timeToClose: 120000,
        });
        return;
      }
      WA.ui.modal.openModal({
        title: 'Activity type 4',
        src: URL,
        allow: 'fullscreen',
        allowApi: true,
        position: 'center',
      });
      const type = activity2Response.nextActivity.type; // value could be 'Type3'
      // the value MUST match the layer name in Tiled

      WA.room.showLayer('activity/' + type);
    });

    WA.room.area.onLeave('ActivityType4').subscribe(() => {
      WA.ui.modal.closeModal();
    });

    // The line below bootstraps the Scripting API Extra library that adds a number of advanced properties/features to WorkAdventure
    bootstrapExtra()
      .then(() => {
        console.log('Scripting API Extra ready');
      })
      .catch((e) => console.error(e));
  })
  .catch((e) => console.error(e));

async function postDataToAPI(
  action: string,
  body: object
): Promise<ApiResponse> {
  try {
    // Make the POST request using the Fetch API
    const response = await fetch(
      'https://polyglot-api-staging.polyglot-edu.com/api/execution/' + action,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Add any additional headers if required
        },
        body: JSON.stringify(body),
      }
    );

    // Check if the response is successful (status code in the range of 200-299)
    if (response.ok) {
      // Parse the JSON response
      const data: ApiResponse = await response.json();

      console.log('Response data:', data);
      // Return the parsed response data
      return data;
    } else {
      // Handle error responses
      console.error('Error:', response.status, response.statusText);
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
  } catch (error) {
    // Handle network errors or other exceptions
    console.error('Error:', error);
    throw error; // Rethrow the error for the caller to handle
  }
}

export {};
