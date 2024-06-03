/// <reference types="@workadventure/iframe-api-typings" />

import { bootstrapExtra } from '@workadventure/scripting-api-extra';
import { AxiosResponse } from 'axios';
import { API, PolyglotNodeValidation } from './data/api';
import { ActionMessage } from '@workadventure/iframe-api-typings';
//import nextActivityImage from '../public/images/exlamationMark.png';
//import { messagesPopup } from './components/userInteraction';

console.log('Script started successfully');

let ctx: string; //to be remove after becoming obsolete, global ctx to keep tracks of this execution
//let flow: string;
let actualActivity: PolyglotNodeValidation;
let menuPopup: any;
let webSite: any = undefined;
let wrongPopup: any = undefined;
let instructionPopup: any = undefined;

function closeWebsite() {
  if (webSite !== undefined) {
    webSite.close();
    webSite = undefined;
  }
}

function closeMenuPopup() {
  if (menuPopup !== undefined) {
    menuPopup.close();
    menuPopup = undefined;
  }
}

function closePopup() {
  if (wrongPopup !== undefined) {
    wrongPopup.close();
    wrongPopup = undefined;
  }
}

function closeInstruction() {
  if (instructionPopup !== undefined) {
    instructionPopup.close();
    instructionPopup = undefined;
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
/*
const mappingActivityBanner = {
  BannerA1: {position:{ x: '16px', y: '180px' }, logo: { x: '16px', y: '180px' }},
  BannerA2: {position:{ x: '650px', y: '290px' }, logo: { x: '16px', y: '180px' }},
  BannerA3: {position:{ x: '650px', y: '130px' }, logo: { x: '16px', y: '180px' }},
  BannerA4: {position:{ x: '257px', y: '68px' }, logo: { x: '16px', y: '180px' }},
};*/

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
  //WA.room.setTiles([{ x: 12, y: 7, tile: "arrowBase", layer: "activity/Type5" }])
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
    const username=WA.player.name;
    const response: AxiosResponse = await API.getFirstNode({ flowId, username });
    // Handle error responses
    if (response.status != 200) {
      console.error('Error:', response.status, response.statusText);
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    ctx = response.data.ctx;

    WA.player.state.flows = [WA.player.state.flows,{ flowId: flowId, ctx: ctx }];
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
    // Flows Menu
    
    WA.room.area.onEnter('Entry').subscribe(async () => {
      try {
        console.log(WA.player.state.actualFlow);
          closeInstruction();
        if (!WA.player.state.actualFlow) {
          instructionPopup = WA.ui.openPopup(
            'instructions',
            'You have not selected a Learning Path, please go to the menu area to choose a path.',
            [
              {
                label: 'Close',
                className: 'normal',
                callback: () => {
                  // Close the popup when the "Close" button is pressed.
                  closeInstruction();
                },
              },
            ]
          );
          setTimeout(function () {
            closeInstruction();
          }, 3000);
          return;
        }
        //@ts-ignore
        //if(WA.player.state.ctx) 
        await startActivity(String(WA.player.state.actualFlow));
        await getActualActivity();
        
        nextActivityBannerV2('instructions');
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
              callback: () => {
                // Close the popup when the "Close" button is pressed.
                closeMenuPopup();
              },
            },
          ]
        );
        setTimeout(function () {
          closeMenuPopup();
        }, 3000);

        webSite = await WA.nav.openCoWebSite(
          //@ts-ignore
          import.meta.env.VITE_WEBAPP_URL + '/?flowList',
          true,
          undefined,
          55
        );
        //open a timed popup to send the user to the right location
      } catch (error) {
        // Handle errors if the API call fails
      }
    });
    WA.room.area.onLeave('FlowsMenu').subscribe(async () => {
      //wrongAreaPopup.close();
      closeWebsite();
    });

    WA.room.area.onEnter('activityManager').subscribe(async () => {
      try {
        console.log('testing FlowsMenu');
        menuPopup = WA.ui.openPopup(
          'MenuBanner',
          'Here you can choose which learning path you want to do, access the console to see the possibilities',
          [
            {
              label: 'Close',
              className: 'normal',
              callback: () => {
                // Close the popup when the "Close" button is pressed.
                closeMenuPopup();
              },
            },
          ]
        );
        setTimeout(function () {
          closeMenuPopup();
        }, 3000);

        webSite = await WA.nav.openCoWebSite(
          //@ts-ignore
          import.meta.env.VITE_FRONTEND_URL + '/waEducator',
          true,
          undefined,
          55
        );
        //open a timed popup to send the user to the right location
      } catch (error) {
        // Handle errors if the API call fails
      }
    });
    WA.room.area.onLeave('activityManager').subscribe(async () => {
      //wrongAreaPopup.close();
      closeWebsite();
    });

    
    // ACTIVITY TYPE 3
    WA.room.area.onEnter('creativeArea').subscribe(async () => {
      // If you need to send data from the first call
      try {
        console.log('area Activity5');

        wrongPopup = WA.ui.openPopup(
          'BannerA5',
          "This area is creative area, here you can access the Learning Path editor to create your personal path",
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

        webSite = await WA.nav.openCoWebSite(
          //@ts-ignore
          import.meta.env.VITE_FRONTEND_URL + '/flows',
          true,
          undefined,
          55
        );

      } catch (error) {
        // Handle errors if the API call fails
        console.error('Failed to get API response:', error);
      }
    });

    WA.room.area.onLeave('creativeArea').subscribe(async () => {
      //wrongAreaPopup.close();
      nextActivityBannerV2('BannerA5');
      closeWebsite();
    });

    let triggerMessage: ActionMessage;
    WA.room.area.onEnter('instructions').subscribe(() => {
      try {
        if (!WA.player.state.actualFlow) {
          triggerMessage = WA.ui.displayActionMessage({
            message:
              "press 'space' or click here to open the instruction WebPage",
            callback: async () => {
              instructionPopup = WA.ui.openPopup(
                'instructions',
                'You have not selected a Learning Path, please go to the menu area to choose a path.',
                [
                  {
                    label: 'Close',
                    className: 'normal',
                    callback: () => {
                      // Close the popup when the "Close" button is pressed.
                      closeInstruction();
                    },
                  },
                ]
              );
              setTimeout(function () {
                closeInstruction();
              }, 3000);
            },
          });

          return;
        }
        triggerMessage = WA.ui.displayActionMessage({
          message:
            "press 'space' or click here to open the instruction WebPage",
          callback: async () => {
            webSite = await WA.nav.openCoWebSite(
              //@ts-ignore
              import.meta.env.VITE_WEBAPP_URL +
                '/?flowList=' +
                WA.player.state.actualFlow,
              true,
              undefined,
              55
            );
          },
        });
      } catch (error) {
        console.log(error);
      }
    });

    WA.room.area.onLeave('instructions').subscribe(async () => {
      triggerMessage.remove();
      closeWebsite();
    });

    WA.player.state.onVariableChange('actualFlow').subscribe(() => {
      closeWebsite();
      closeMenuPopup();
      menuPopup = WA.ui.openPopup(
        'MenuBanner',
        'Learning path chose correctly, enter the school zone to start ',
        [
          {
            label: 'Close',
            className: 'normal',
            callback: () => {
              // Close the popup when the "Close" button is pressed.
              closeMenuPopup();
            },
          },
        ]
      );
      setTimeout(function () {
        closeMenuPopup();
      }, 3000);

      console.log('website closed');
      return;
    });

    WA.player.state.onVariableChange('platform').subscribe((value) => {
      if (value != 'WebApp') {
        closeWebsite();
        console.log('website closed');
        nextActivityBannerV2('BannerA1');
      }
      return;
    });

    WA.room.area.onEnter('ActivityType1').subscribe(async () => {
      try {
        console.log('testing ACTIVITYTYPE1');
        if (actualActivity.platform != 'WebApp') {
          console.log('wrong spot, go to another area');
          wrongAreaFunction('BannerA1', 'WebApp');
          return;
        }
        const URL =
          //@ts-ignore
          import.meta.env.VITE_WEBAPP_URL +
          '/?&ctx=' +
          ctx +
          '&rememberTipologyQuiz=' +
          actualActivity.type;
        webSite = await WA.nav.openCoWebSite(URL, true);
        console.log(URL);
        //open a timed popup to send the user to the right location
      } catch (error) {
        // Handle errors if the API call fails
      }
    });
    
    WA.room.area.onLeave('ActivityType1').subscribe(async () => {
      closeWebsite();
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

        /*if (actualActivity.platform != '
        Board') {
          console.log('wrong spot, go to another area');
          wrongAreaFunction('BannerA3', 'MiroBoard');
          return;
        }*/

        webSite = await WA.nav.openCoWebSite(
          'https://app.eraser.io/workspace/JVoolrO5JJucnQkr1tK7?origin=share',
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
      closeWebsite();
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
              label: 'Open Notebook',
              className: 'normal',
              callback: () => {
                // Close the popup when the "Close" button is pressed.
                WA.nav.openTab(
                  'vscode://ms-dotnettools.dotnet-interactive-vscode/openNotebook?url=' + //@ts-ignore
                    import.meta.env.VITE_BACK_URL +
                    '/api/flows/' +
                    ctx +
                    '/run/notebook.dib'
                );
                console.log('aa');
              },
            },
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

        triggerMessage = WA.ui.displayActionMessage({
          message:
            "press 'space' or click here to open the instruction WebPage",
          callback: async () => {
            window.open(
              'vscode://ms-dotnettools.dotnet-interactive-vscode/openNotebook?url=' + //@ts-ignore
                import.meta.env.VITE_BACK_URL +
                '/api/flows/' +
                ctx +
                '/run/notebook.dib',
              '_blank'
            );
          },
        });
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
