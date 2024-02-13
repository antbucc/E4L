/// <reference types="@workadventure/iframe-api-typings" />

import { bootstrapExtra } from "@workadventure/scripting-api-extra";

console.log('Script started successfully');

let activity1Response = {}
let activity2Response = {}
//let activity3Response = {}
//let activity4Response = {}

// Waiting for the API to be ready
WA.onInit().then(async () => {
    console.log('Scripting API ready');
    console.log('Player tags: ',WA.player.tags)

    WA.room.area.onEnter('ActivityType1').subscribe(async () => {
         // Call the function to fetch data from the API
        activity1Response = await postDataToAPI(
            'https://polyglot-api-staging.polyglot-edu.com/api/execution/first',
            {
                flowId: '95316bc8-caea-486f-95ad-ba635a9608c4'
            }
        );

        console.log('activity1Response',activity1Response)

    //    WA.ui.modal.openModal({
    //         title: "Activity",
    //         src: activity1Response.url,
    //         allow: "fullscreen",
    //         allowApi: true,
    //         position: "center",
    //     });
    })

    WA.room.area.onLeave('ActivityType1').subscribe(() => {
        WA.ui.modal.closeModal()
    })

    WA.room.area.onEnter('ActivityType2').subscribe(async () => {
        // Call the function to fetch data from the API
        activity2Response = await postDataToAPI(
           'https://polyglot-api-staging.polyglot-edu.com/api/execution/actual',
           {
            "ctxId": "802110e4-1e67-4012-9b08-af6f18f82683"
            }
       );

       // const next = activity2Response.nextActivity.type
       const next = 'Type3'

       WA.room.showLayer('activity/' + next)
   })

   WA.room.area.onLeave('ActivityType2').subscribe(() => {
       WA.ui.modal.closeModal()
   })

    // The line below bootstraps the Scripting API Extra library that adds a number of advanced properties/features to WorkAdventure
    bootstrapExtra().then(() => {
        console.log('Scripting API Extra ready');
    }).catch(e => console.error(e));

}).catch(e => console.error(e));

async function postDataToAPI(endpoint: string, body: object): Promise<any> {
    try {
        // Make the POST request using the Fetch API
        const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            // Add any additional headers if required
        },
        body: JSON.stringify(body),
        });

        // Check if the response is successful (status code in the range of 200-299)
        if (response.ok) {
            // Parse the JSON response
            const data = await response.json();

            // Process the response data
            console.log('Response data:', data);
            return data;

            // You can perform further actions with the response data here
        } else {
            // Handle error responses
            console.error('Error:', response.status, response.statusText);
        }
    } catch (error) {
        // Handle network errors or other exceptions
        console.error('Error:', error);
    }
}
  

export {};
