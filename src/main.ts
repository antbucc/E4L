/// <reference types="@workadventure/iframe-api-typings" />

import { bootstrapExtra } from '@workadventure/scripting-api-extra';
import { AxiosResponse } from 'axios';
import { API, PolyglotNodeValidation } from './data/api';

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

    // ACTIVITY TYPE 1
    WA.room.area.onEnter('ActivityType1').subscribe(async () => {
      try {
        console.log('testing quiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiii');
        const exerciseType = await startActivity(
          '95316bc8-caea-486f-95ad-ba635a9608c4'
        );
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
      const exerciseInfo = getActualActivity();
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

    WA.room.area.onLeave('ActivityType2').subscribe(() => {
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

export {};
