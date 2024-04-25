/// <reference types="@workadventure/iframe-api-typings" />

import { bootstrapExtra } from '@workadventure/scripting-api-extra';
import { AxiosResponse } from 'axios';
import { API, PolyglotNodeValidation } from './data/api';
import { Popup, UIWebsite } from '@workadventure/iframe-api-typings';

console.log('Script started successfully');

let ctx: string; //to be remove after becoming obsolete, global ctx to keep tracks of this execution
let actualActivity: PolyglotNodeValidation;
let wrongAreaPopup: Popup;
let menuPopup: Popup;

async function nextActivityBanner() {
  await getActualActivity();
  WA.ui.banner.openBanner({
    id: 'NextBanner',
    text:
      'Your next activity is "' +
      actualActivity.type +
      '", go to the correct area.',
    bgColor: '#000000',
    textColor: '#ffffff',
    closable: true,
    timeToClose: 6000,
  });
}

async function nextActivityBannerV2(areaPopup: string) {
  await getActualActivity();
  const nextActivityPopup = WA.ui.openPopup(
    areaPopup,
    'Your next activity is in "' +
      actualActivity.platform +
      '", go to the correct area.',
    [
      {
        label: 'Close',
        className: 'normal',
        callback: (popup) => {
          // Close the popup when the "Close" button is pressed.
          popup.close();
        },
      },
    ]
  );
  setTimeout(function () {
    nextActivityPopup.close();
  }, 2000);
}

async function getActualActivity() {
  try {
    if (!ctx) throw 'No ctx detected';
    const response: AxiosResponse = await API.getActualNode({ ctxId: ctx });
    if (response.status != 200) {
      console.error('Error:', response.status, response.statusText);
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    actualActivity = response.data;
  } catch (error) {
    // Handle network errors or other exceptions
    console.error('Error:', error);
    throw error; // Rethrow the error for the caller to handle
  }
}

async function startActivity(flowId: string): Promise<any> {
  try {
    const response: AxiosResponse = await API.getFirstNode({ flowId });
    // Handle error responses
    if (response.status != 200) {
      console.error('Error:', response.status, response.statusText);
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    ctx = response.data.ctx;
    return;
  } catch (error) {
    // Handle network errors or other exceptions
    console.error('Error:', error);
    throw error; // Rethrow the error for the caller to handle
  }
}

// Waiting for the API to be ready
WA.onInit()
  .then(async () => {
    console.log('Scripting API ready');
    try {
      await startActivity('acd235b9-7504-4975-a0c7-96914480d498');
      await getActualActivity();
      wrongAreaPopup = WA.ui.openPopup(
        'instructions',
        'Your next activity is in "' +
          actualActivity.platform +
          '", go to the correct area.',
        [
          {
            label: 'Close',
            className: 'normal',
            callback: (popup) => {
              // Close the popup when the "Close" button is pressed.
              popup.close();
            },
          },
        ]
      );
      setTimeout(function () {
        wrongAreaPopup.close();
      }, 2000);
      //open a timed popup to send the user to the right location
    } catch (error) {
      // Handle errors if the API call fails
      console.error('Failed to get API response:', error);
    }
    let website: Promise<UIWebsite>;
    // Flows Menu
    WA.room.area.onEnter('FlowsMenu').subscribe(async () => {
      try {
        console.log('testing FlowsMenu');
        menuPopup = WA.ui.openPopup(
          'MenuBanner',
          'Here you can choose which learning path you want to do, access the console to see the possibilities',
          [
            {
              label: 'Close',
              className: 'normal',
              callback: (popup) => {
                // Close the popup when the "Close" button is pressed.
                popup.close();
              },
            },
          ]
        );
        setTimeout(function () {
          menuPopup.close();
        }, 2000);
        //open a timed popup to send the user to the right location
      } catch (error) {
        // Handle errors if the API call fails
      }
    });
    WA.room.area.onLeave('FlowsMenu').subscribe(async () => {
      //wrongAreaPopup.close();
      if (menuPopup) menuPopup.close();
    });

    WA.room.area.onEnter('ActivityType1').subscribe(async () => {
      try {
        console.log('testing ACTIVITYTYPE1');
        if (actualActivity.platform != 'WebApp') {
          console.log('wrong spot, go to another area');
          WA.ui.banner.openBanner({
            id: 'ReadMaterialBanner',
            text: 'Wrong area, here you are able to make activity connected to the WebApp',
            bgColor: '#000000',
            textColor: '#ffffff',
            closable: true,
            timeToClose: 6000,
          });
          return;
        }
        const URL =
          //@ts-ignore
          import.meta.env.VITE_WEBAPP_URL +
          '/?&ctx=' +
          ctx +
          '&rememberTipologyQuiz=' +
          actualActivity.type;

        website = WA.ui.website.open({
          url: URL,
          allowApi: true,
          position: {
            vertical: 'top',
            horizontal: 'right',
          },
          size: {
            // Size on the UI (available units: px|em|%|cm|in|pc|pt|mm|ex|vw|vh|rem and others values auto|inherit)
            height: '100%',
            width: '50%',
          },
        });
        //open a timed popup to send the user to the right location
      } catch (error) {
        // Handle errors if the API call fails
      }
    });
    WA.room.area.onLeave('ActivityType1').subscribe(async () => {
      //wrongAreaPopup.close();
      nextActivityBannerV2('BannerA1');
      const closingPopup = wrongAreaPopup;
      setTimeout(function () {
        closingPopup.close();
      }, 3000);
      (await website).close();
    });

    // ACTIVITY TYPE 2
    WA.room.area.onEnter('ActivityType2').subscribe(async () => {
      // If you need to send data from the first call
      console.log('ctx:', ctx);
      try {
        console.log('testing ACTIVITYTYPE2');
        const URL =
          //@ts-ignore
          import.meta.env.VITE_WEBAPP_URL +
          '/?&ctx=' +
          ctx +
          '&rememberTipologyQuiz=' +
          actualActivity.type;
        if (actualActivity.platform != 'WebApp') {
          console.log('wrong spot, go to another area');
          WA.ui.banner.openBanner({
            id: 'ReadMaterialBanner',
            text: 'Wrong area, here you are able to make activity connected to the WebApp',
            bgColor: '#000000',
            textColor: '#ffffff',
            closable: true,
            timeToClose: 6000,
          });
          return;
        }
        WA.ui.modal.openModal({
          title: 'Activity type 2',
          src: URL,
          allowApi: true,
          position: 'right',
          allow: null,
        });
      } catch (error) {
        // Handle errors if the API call fails
        console.error('Failed to get API response:', error);
      }
    });

    WA.room.area.onLeave('ActivityType2').subscribe(async () => {
      //wrongAreaPopup.close();
      nextActivityBannerV2('BannerA2');
      const closingPopup = wrongAreaPopup;
      setTimeout(function () {
        closingPopup.close();
      }, 3000);
      WA.ui.modal.closeModal();
    });

    // ACTIVITY TYPE 3
    WA.room.area.onEnter('ActivityType3').subscribe(async () => {
      // If you need to send data from the first call
      try {
        console.log('activity3Response');
        // You can use activity2Response in subsequent parts of your code
        const URL = //@ts-ignore
          import.meta.env.WEBAPP_URL +
          '/?&ctx=' +
          ctx +
          '&rememberTipologyQuiz=' +
          actualActivity.type;
        if (actualActivity.platform != 'VSCode') {
          console.log('wrong spot, go to another area');
          WA.ui.banner.openBanner({
            id: 'MultichoiceQuestionBanner',
            text: 'Wrong area, here you are able to make activity connected to the VSCode',
            bgColor: '#000000',
            textColor: '#ffffff',
            closable: true,
            timeToClose: 6000,
          });
        } /*
        WA.ui.modal.openModal({
          title: 'Activity type 3',
          src: URL,
          allow: 'fullscreen',
          allowApi: true,
          position: 'center',
        });*/
      } catch (error) {
        // Handle errors if the API call fails
        console.error('Failed to get API response:', error);
      }
    });

    WA.room.area.onLeave('ActivityType3').subscribe(async () => {
      //wrongAreaPopup.close();
      nextActivityBannerV2('BannerA3');
      const closingPopup = wrongAreaPopup;
      setTimeout(function () {
        closingPopup.close();
      }, 3000);
      WA.ui.modal.closeModal();
    });

    // ACTIVITY TYPE 4
    WA.room.area.onEnter('ActivityType4').subscribe(async () => {
      // If you need to send data from the first call
      try {
        //@ts-ignore
        console.log(import.meta.env.VITE_WEBAPP_URL);
        const URL = //@ts-ignore
          import.meta.env.VITE_WEBAPP_URL +
          '/?&ctx=' +
          ctx +
          '&rememberTipologyQuiz=' +
          actualActivity.type;
        wrongAreaPopup = WA.ui.openPopup(
          'BannerA4',
          'Wrong area, here you can do multichoice question lessons!!!!!!!!!',
          [
            {
              label: 'Close',
              className: 'normal',
              callback: (popup) => {
                // Close the popup when the "Close" button is pressed.
                popup.close();
              },
            },
          ]
        );
        console.log('hrere');
      } catch (error) {
        // Handle errors if the API call fails
        console.error('Failed to get API response:', error);
      }
    });

    WA.room.area.onLeave('ActivityType4').subscribe(async () => {
      wrongAreaPopup.close();
      nextActivityBannerV2('BannerA4');
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
