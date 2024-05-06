/// <reference types="@workadventure/iframe-api-typings" />

import { bootstrapExtra } from '@workadventure/scripting-api-extra';
import { AxiosResponse } from 'axios';
import { API, PolyglotNodeValidation } from './data/api';
import {
  ActionMessage,
  CoWebsite,
  Popup,
} from '@workadventure/iframe-api-typings';

console.log('Script started successfully');

let ctx: string; //to be remove after becoming obsolete, global ctx to keep tracks of this execution
//let flow: string;
let actualActivity: PolyglotNodeValidation;
let menuPopup: Popup;
const flowId = 'acd235b9-7504-4975-a0c7-96914480d498';
let webSite: CoWebsite;
let wrongPopup: any = undefined;

function closePopup() {
  if (wrongPopup !== undefined) {
    wrongPopup.close();
    wrongPopup = undefined;
  }
}

function wrongAreaFunction(where: string, activity: string) {
  closePopup();
  wrongPopup = WA.ui.openPopup(
    where,
    'Wrong area, here you are able to make activity connected to ' + activity,
    [
      {
        label: 'Close',
        className: 'normal',
        callback: () => {
          // Close the popup when the "Close" button is pressed.
          closePopup();
        },
      },
    ]
  );
  setTimeout(function () {
    closePopup();
  }, 3000);
}

async function nextActivityBannerV2(areaPopup: string) {
  await getActualActivity();
  closePopup();
  wrongPopup = WA.ui.openPopup(
    areaPopup,
    'Your next activity is in "' +
      actualActivity.platform +
      '", go to the correct area.',
    [
      {
        label: 'Close',
        className: 'normal',
        callback: () => {
          // Close the popup when the "Close" button is pressed.
          closePopup();
        },
      },
    ]
  );
  setTimeout(function () {
    closePopup();
  }, 3000);
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
    WA.player.state.flows = { flowId: 'ctxId' };
    await startActivity(flowId);
    // Flows Menu

    WA.room.area.onEnter('Entry').subscribe(async () => {
      try {
        console.log(WA.player.state.actualFlow);
        if (!WA.player.state.actualFlow) {
          const instructionPopup = WA.ui.openPopup(
            'instructions',
            'You have not selected a Learning Path, please go to the menu area to choose a path.',
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
            instructionPopup.close();
          }, 3000);
          return;
        }
        //@ts-ignore
        await startActivity(WA.player.state.actualFlow);
        await getActualActivity();
        const instructionPopup = WA.ui.openPopup(
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
          instructionPopup.close();
        }, 3000);
        //open a timed popup to send the user to the right location
      } catch (error) {
        // Handle errors if the API call fails
        console.error('Failed to get API response:', error);
      }
    });

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
        }, 3000);

        webSite = await WA.nav.openCoWebSite(
          //@ts-ignore
          'http://localhost:3000/?flowList',
          true
        );
        //open a timed popup to send the user to the right location
      } catch (error) {
        // Handle errors if the API call fails
      }
    });
    WA.room.area.onLeave('FlowsMenu').subscribe(async () => {
      //wrongAreaPopup.close();
      webSite.close();
    });
    let triggerMessage: ActionMessage;
    WA.room.area.onEnter('instructions').subscribe(() => {
      try {
        triggerMessage = WA.ui.displayActionMessage({
          message: "press 'space' or click here to open the instructionWebPage",
          callback: async () => {
            webSite = await WA.nav.openCoWebSite(
              //@ts-ignore
              'http://localhost:3000/?flowList=' + WA.player.state.actualFlow,
              true
            );
          },
        });
      } catch (error) {
        console.log(error);
      }
    });

    WA.room.area.onLeave('instructions').subscribe(async () => {
      webSite.close();
      triggerMessage.remove();
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
        webSite = await WA.nav.openCoWebSite(URL);
        //open a timed popup to send the user to the right location
      } catch (error) {
        // Handle errors if the API call fails
      }
    });
    WA.room.area.onLeave('ActivityType1').subscribe(async () => {
      webSite.close();
      nextActivityBannerV2('BannerA1');
    });

    // ACTIVITY TYPE 2
    WA.room.area.onEnter('ActivityType2').subscribe(async () => {
      // If you need to send data from the first call
      console.log('ctx:', ctx);
      try {
        console.log('testing ACTIVITYTYPE2');
      } catch (error) {
        // Handle errors if the API call fails
        console.error('Failed to get API response:', error);
      }
    });

    WA.room.area.onLeave('ActivityType2').subscribe(async () => {
      //wrongAreaPopup.close();
      nextActivityBannerV2('BannerA2');
    });

    // ACTIVITY TYPE 3
    WA.room.area.onEnter('ActivityType3').subscribe(async () => {
      // If you need to send data from the first call
      try {
        console.log('area Activity3');
        // You can use activity2Response in subsequent parts of your code
        /*if (actualActivity.platform != 'MiroBoard') {
          console.log('wrong spot, go to another area');
          wrongAreaFunction('BannerA3', 'MiroBoard');
          return;
        }*/

        webSite = await WA.nav.openCoWebSite(
          'https://miro.com/app/board/uXjVKM6hUiY=/?share_link_id=721292236858',
          true
        );
      } catch (error) {
        // Handle errors if the API call fails
        console.error('Failed to get API response:', error);
      }
    });

    WA.room.area.onLeave('ActivityType3').subscribe(async () => {
      //wrongAreaPopup.close();
      nextActivityBannerV2('BannerA3');
      webSite.close();
    });

    // ACTIVITY TYPE 4
    WA.room.area.onEnter('ActivityType4').subscribe(async () => {
      // If you need to send data from the first call
      try {
        if (actualActivity.platform != 'VSCode') {
          wrongAreaFunction('BannerA4', 'VSCode');
          return;
        }
        closePopup();
        WA.ui.openPopup(
          'BannerA4',
          'Download and open your notebook (run this link for the download: ' + //@ts-ignore
            import.meta.env.VITE_BACK_URL +
            '/api/flows/' +
            ctx +
            '/run ).\nExecute the notebook in VSCode to complete the exercise',
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
      } catch (error) {
        // Handle errors if the API call fails
        console.error('Failed to get API response:', error);
      }
    });

    WA.room.area.onLeave('ActivityType4').subscribe(async () => {
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
