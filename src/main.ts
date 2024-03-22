/// <reference types="@workadventure/iframe-api-typings" />

import { bootstrapExtra } from '@workadventure/scripting-api-extra';

console.log('Script started successfully');

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

function getActualActivity() {}

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
        activity1Response = await postDataToAPI('first', {
          flowId: '95316bc8-caea-486f-95ad-ba635a9608c4',
        });
        console.log('activity1Response', activity1Response);
        // You can use activity1Response in subsequent parts of your code
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
      console.log('activity1Response', activity1Response);

      try {
        activity2Response = await postDataToAPI('actual', {
          ctxId: '802110e4-1e67-4012-9b08-af6f18f82683',
        });
        console.log('activity2Response', activity2Response);
        // You can use activity2Response in subsequent parts of your code
      } catch (error) {
        // Handle errors if the API call fails
        console.error('Failed to get API response:', error);
      }

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
