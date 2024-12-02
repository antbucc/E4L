/// <reference types="@workadventure/iframe-api-typings" />

import { bootstrapExtra } from '@workadventure/scripting-api-extra';
import { AxiosResponse } from 'axios';
import { API, PolyglotNodeValidation } from './data/api';
import { ActionMessage } from '@workadventure/iframe-api-typings';
import { getQuest, levelUp } from '@workadventure/quests';
import { keyMapping } from './types/PolyglotFlow';
import { LevelUpResponse } from '@workadventure/quests/dist/LevelUpResponse';
//import { messagesPopup } from './components/userInteraction';

console.log('Script started successfully');

let ctx: string | undefined; //to be remove after becoming obsolete, global ctx to keep tracks of this execution
//let flow: string;
let actualActivity: PolyglotNodeValidation;
let menuPopup: any;
let webSite: any = undefined;
let wrongPopup: any = undefined;
let instructionPopup: any = undefined;
//let narrativePopup: any = undefined;
let road: { x: number; y: number }[] = [{ x: 0, y: 0 }];
let projectIdPapy: string;
let representationPapy: string;
let triggerMessage: ActionMessage;

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
/*
function closeNarrative() {
  if (narrativePopup !== undefined) {
    narrativePopup.close();
    narrativePopup = undefined;
  }
}*/

function displayMainDoor() {
  if (WA.player.state.actualFlow && WA.player.state.actualFlow != 'null')
    WA.state.door = true;
  if (WA.state.door) {
    WA.room.showLayer('main_door_open');
    WA.room.hideLayer('main_door_close');
    WA.room.hideLayer('collision_main_door');
    console.log('open');
  } else {
    WA.room.hideLayer('main_door_open');
    WA.room.showLayer('main_door_close');
    WA.room.showLayer('collision_main_door');
    console.log('close');
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

//async function narrativeMessage() {
/*
    let tiledMap = await WA.room.getTiledMap();
    
    // Add the new layer to the map
    tiledMap.layers.push({
      name: "bannerNarrative",
      width: 50, 
      height: 50, 
      y: 80,
      visible: true,
      opacity: 1,
      properties: [],
      type: 'tilelayer'
    });
    await WA.room.area.create({
      name: "bannerNarrative", 
      x: 10,      // X position
      y: 10,      // Y position
      width: 10,  // Width size
      height: 10, // Height size
  });
  */
//  const playerPos = await WA.player.getPosition();
//  console.log(playerPos.y);
//  const bannerPosition =
//    playerPos.y > 300 ? 'bannerNarrative2' : 'bannerNarrative1';
//
//  let narration =
//    "The city of Technopolis is falling apart. Its digital infrastructure, once the envy of the world, is now in chaos due to a centuries-old, corrupted system architecture. As an appointed Architect of Code, your task is to restore stability. But this mission is not yours alone—there are others, racing against you to solve Technopolis' problems and earn the title of Grand Architect. \nYou'll traverse a sprawling digital city using a 2D map to navigate through different rooms where critical missions await. Every room contains learning challenges related to UML Modeling and in particular Class diagrams. Along the way, you'll collect points, badges, and level up, but only the top three learners will appear on the final Leaderboard, earning the ultimate rewards.";
//  if (actualActivity) narration = actualActivity.description;
//  triggerMessage = WA.ui.displayActionMessage({
//    message: "press 'space' or click here to open the narrative",
//    callback: async () => {
//      closeInstruction();
//      narrativePopup = WA.ui.openPopup(bannerPosition, narration, [
//        {
//          label: 'Close',
//          className: 'normal',
//          callback: () => {
//            // Close the popup when the "Close" button is pressed.
//            //narrativeMessage();
//              try {
//
//                triggerMessage.remove();
//                } catch (error) {
//                  console.log(error);
//                }
//            closeNarrative();
//          },
//        },
//      ]);
//      setTimeout(function () {
//        closeInstruction();
//        //narrativeMessage();
//          try {
//
//        triggerMessage.remove();
//        } catch (error) {
//          console.log(error);
//        }
//      }, 8000);
//    },
//  });
//}

const mappingActivity = [
  {
    platform: ['VSCode'],
    activityType: 4,
    pos: {
      x: 12,
      y: 6,
    },
  },
  {
    platform: ['WebApp'],
    activityType: 1,
    pos: {
      x: 25,
      y: 5,
    },
  },
  {
    platform: ['Eraser', 'PapyrusWeb'],
    activityType: 3,
    pos: {
      x: 17,
      y: 4,
    },
  },
];

let nextPos = { x: 0, y: 0 };

async function nextActivityBannerV2(areaPopup: string) {
  let platform = '';
  if (actualActivity) platform = actualActivity.platform;
  await getActualActivity(platform);
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
  mappingActivity.map((map) => {
    if (map.platform.includes(actualActivity.platform))
      nextPos = { x: map.pos.x, y: map.pos.y + 2 };
    WA.room.setTiles([
      {
        x: map.pos.x,
        y: map.pos.y,
        tile: map.platform.includes(actualActivity.platform)
          ? 'arrowBase'
          : null,
        layer: 'activity/Type5',
      },
    ]);
  });

  let actualPos = await WA.player.getPosition();

  let toCancel;
  do {
    toCancel = road.pop();
    if (toCancel)
      WA.room.setTiles([
        {
          x: toCancel.x,
          y: toCancel.y,
          tile: null,
          layer: 'activity/Type5',
        },
      ]);
  } while (toCancel);
  actualPos = {
    x: Math.floor(actualPos.x / 33),
    y: Math.floor(actualPos.y / 33),
  };
  let i = 0; //debugger
  let again;
  if (nextPos.x != 0)
    do {
      i++;
      again =
        Math.abs(actualPos.y - nextPos.y) < 3 &&
        Math.abs(actualPos.x - nextPos.x) < 3
          ? false
          : true;

      if (Math.abs(actualPos.y - nextPos.y) > 1) {
        const tilePosX = actualPos.x;
        const tilePosY = actualPos.y + (actualPos.y < nextPos.y ? 2 : -2);

        WA.room.setTiles([
          {
            x: tilePosX,
            y: tilePosY,
            tile: 'pointerBase',
            layer: 'activity/Type5',
          },
        ]);
        road.push({ x: tilePosX, y: tilePosY });
        actualPos = { x: tilePosX, y: tilePosY };
      } else if (Math.abs(actualPos.x - nextPos.x) > 1) {
        const tilePosX = actualPos.x + (actualPos.x < nextPos.x ? 2 : -2);
        const tilePosY = actualPos.y;

        WA.room.setTiles([
          {
            x: tilePosX,
            y: tilePosY,
            tile: 'pointerBase',
            layer: 'activity/Type5',
          },
        ]);
        road.push({ x: tilePosX, y: tilePosY });
        actualPos = { x: tilePosX, y: tilePosY };
      }
    } while (again && i < 20);
}

WA.player.onPlayerMove(async () => {
  if (nextPos.x == 0) return; //means has no next edge

  let toCancel;
  do {
    toCancel = road.pop();
    if (toCancel)
      WA.room.setTiles([
        {
          x: toCancel.x,
          y: toCancel.y,
          tile: null,
          layer: 'activity/Type5',
        },
      ]);
  } while (toCancel);

  let actualPos = await WA.player.getPosition();
  actualPos = {
    x: Math.floor(actualPos.x / 33),
    y: Math.floor(actualPos.y / 33),
  };
  let i = 0; //debugger
  let again;
  if (nextPos.x != 0)
    do {
      i++;
      again =
        Math.abs(actualPos.y - nextPos.y) < 3 &&
        Math.abs(actualPos.x - nextPos.x) < 3
          ? false
          : true;

      if (Math.abs(actualPos.y - nextPos.y) > 1) {
        const tilePosX = actualPos.x;
        const tilePosY = actualPos.y + (actualPos.y < nextPos.y ? 2 : -2);
        WA.room.setTiles([
          {
            x: tilePosX,
            y: tilePosY,
            tile: 'pointerBase',
            layer: 'activity/Type5',
          },
        ]);
        road.push({ x: tilePosX, y: tilePosY });
        actualPos = { x: tilePosX, y: tilePosY };
      } else if (Math.abs(actualPos.x - nextPos.x) > 1) {
        const tilePosX = actualPos.x + (actualPos.x < nextPos.x ? 2 : -2);
        const tilePosY = actualPos.y;

        WA.room.setTiles([
          {
            x: tilePosX,
            y: tilePosY,
            tile: 'pointerBase',
            layer: 'activity/Type5',
          },
        ]);
        road.push({ x: tilePosX, y: tilePosY });
        actualPos = { x: tilePosX, y: tilePosY };
      }
    } while (again && i < 20);
});

async function getActualActivity(playerPlatform: string) {
  try {
    console.log('getActual');
    if (!ctx) throw 'No ctx detected';
    await API.getActualNode({ ctxId: ctx })
      .then(async (response) => {
        console.log((response.data as PolyglotNodeValidation).platform);

        if (actualActivity)
          if (
            (response.data as PolyglotNodeValidation).platform !=
            actualActivity.platform
          ) {
            //LP completed
            if (actualActivity.platform == 'PapyrusWeb' && projectIdPapy) {
              const points = (await API.userPapyPoints(projectIdPapy)).data;
              console.log(points.Grade);
              const index = (points.Grade as string).indexOf(' out');
              const grade = parseInt(
                (points.Grade as string).substring(0, index)
              );
              console.log(grade);
              await levelUp('demo2024event', grade * 10)
                .then(async (response: LevelUpResponse) => {
                  console.log(response);
                  if (response.awardedBadges != null)
                    await levelUp(
                      'generalKey',
                      keyMapping.find((map) => map.key == 'demo2024event')
                        ?.generalPoints ?? 0
                    );
                })
                .catch((e) => console.log(e));
            } else {
              try {
                await levelUp(
                  keyMapping.find((map) =>
                    map.cases.includes(actualActivity.platform)
                  )?.key ?? '',
                  50
                )
                  .then(async (response: LevelUpResponse) => {
                    if (response.awardedBadges != null)
                      await levelUp(
                        'generalKey',
                        keyMapping.find((map) =>
                          map.cases.includes(actualActivity.platform)
                        )?.generalPoints ?? 0
                      );
                  })
                  .catch((e) => console.log(e));
              } catch (error) {
                console.log(error);
              }
              console.log('platform point given');
            }
          }
        actualActivity = response.data;
        console.log(actualActivity.validation);
        if (
          !actualActivity.validation[0] &&
          playerPlatform == actualActivity.platform
        ) {
          //LP completed
          console.log('LP point given');
          await levelUp('keyLP', 100).catch((e) => console.log(e));
          WA.player.state.actualFlow = '';
          ctx = undefined;
        }
        if (actualActivity.platform == 'PapyrusWeb') {
          WA.room.showLayer('PapyrusWebIcon');
          WA.room.hideLayer('CollaborativeIcon');
        } else {
          WA.room.showLayer('CollaborativeIcon');
          WA.room.hideLayer('PapyrusWebIcon');
        }
      })
      .catch(async (error: any) => {
        console.log(error);
        if (error.response.status)
          if (error.response.status == 400) {
            //means the educator resetted the player context
            console.log('ctx reset');

            console.log(String(WA.player.state.actualFlow));
            await startActivity(String(WA.player.state.actualFlow)).then(
              async () => {
                console.log('new activity correctly');
                await getActualActivity('reset');
              }
            );
            return;
          }
        console.error(
          'Error:',
          error.response.status,
          error.response.statusText
        );
        throw new Error(`HTTP error! Status: ${error.response.status}`);
      });
  } catch (error: any) {
    // Handle network errors or other exceptions
    console.error('Error:', error);
    throw error; // Rethrow the error for the caller to handle
  }
}

async function startActivity(flowId: string): Promise<any> {
  try {
    const username = WA.player.name;
    const response: AxiosResponse = await API.getFirstNode({
      flowId,
      username,
    });
    console.log(flowId);
    // Handle error responses
    if (response.status != 200) {
      console.error('Error:', response.status, response.statusText);
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    ctx = response.data.ctx;
    let flowsUser = WA.player.state.flows as [any];

    if (flowsUser != undefined)
      if (
        (flowsUser as [{ flowId: string; ctx: string }]).find((flow) => {
          if (flow != null) return flowId == flow.flowId;
          return false;
        })
      )
        flowsUser.find((flow) => {
          if (flow) return flowId == flow.flowId;
          return false;
        }).ctx = ctx;
      //update ctx of a already started LP
      else flowsUser[flowsUser.length + 1] = { flowId: flowId, ctx: ctx };
    //add the new flowId and ctx to the array
    else flowsUser = [{ flowId: flowId, ctx: ctx }]; //case where there are no ctx-> create the first one

    WA.player.state.flows = flowsUser;
    console.log('starting activity done');
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
    if (WA.player.name == 'Tmao' || WA.player.name == 'Antonio Bucchiarone')
      WA.room.hideLayer('collision_manager_door');
    console.log('Scripting API ready');
    WA.room.showLayer('PapyrusWebIcon');
    WA.room.hideLayer('CollaborativeIcon');
    // Flows Menu
    WA.room.website.create({
      name: 'logo',
      url: './images/solo_logo_32.png',
      position: {
        x: 220,
        y: 496,
        width: 64,
        height: 64,
      },
      visible: true,
      origin: 'map',
      scale: 1,
    });
    displayMainDoor();
    WA.room.website.create({
      name: 'scritta',
      url: './images/solo_scritta_32.png',
      position: {
        x: 388,
        y: 496,
        width: 418,
        height: 64,
      },
      visible: true,
      origin: 'map',
      scale: 1,
    });
    //narrativeMessage();
    WA.room.area.onLeave('Outside').subscribe(async () => {
      nextPos = { x: 0, y: 0 };
      let toCancel;
      do {
        toCancel = road.pop();
        if (toCancel)
          WA.room.setTiles([
            {
              x: toCancel.x,
              y: toCancel.y,
              tile: null,
              layer: 'activity/Type5',
            },
          ]);
      } while (toCancel);
    });

    WA.room.area.onEnter('Entry').subscribe(async () => {
      try {
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

        console.log(WA.player.state.actualFlow);
        const flowsUser = WA.player.state.flows;

        if (flowsUser != undefined)
          if (
            (flowsUser as [{ flowId: string; ctx: string }]).find(
              (flow: { flowId: string }) =>
                flow?.flowId == WA.player.state.actualFlow
            ) != undefined
          ) {
            ctx = (flowsUser as [{ flowId: string; ctx: string }]).find(
              (flow: { flowId: string }) =>
                flow?.flowId == WA.player.state.actualFlow
            )!.ctx;
            console.log('ctx already created, continue activity');
            nextActivityBannerV2('instructions');
            return;
          }
        console.log('starting activity');
        await startActivity(String(WA.player.state.actualFlow));

        await getActualActivity('instruction');

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
        menuPopup = await WA.ui.openPopup(
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
        closeWebsite();
        webSite = await WA.nav.openCoWebSite(
          //@ts-ignore
          import.meta.env.VITE_WEBAPP_URL + '/flowMenu',
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
        //put the disable of the roof
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

        closeWebsite();
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
          'This area is creative area, here you can access the Learning Path editor to create your personal path',
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
        closeWebsite();

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

    WA.room.area.onEnter('instructions').subscribe(() => {
      try {
        try {
          triggerMessage.remove();
        } catch (error) {
          console.log(error);
        }
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
            closeWebsite();
            webSite = await WA.nav.openCoWebSite(
              //@ts-ignore
              import.meta.env.VITE_WEBAPP_URL +
                '/flowShower/' +
                WA.player.state.actualFlow ?? '',
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
      try {
        triggerMessage.remove();
      } catch (error) {
        console.log(error);
      }
      //narrativeMessage();
      closeWebsite();
    });

    WA.player.state.onVariableChange('actualFlow').subscribe(() => {
      if (WA.player.state.actualFlow == 'null') WA.state.door = false;
      closeWebsite();
      closeMenuPopup();
      displayMainDoor();
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
          import.meta.env.VITE_WEBAPP_URL + '/tools/' + ctx;

        closeWebsite();
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

        if (actualActivity.platform == 'PapyrusWeb') {
          const waitingPopup = WA.ui.openPopup(
            'BannerA3',
            'Loading your assignment inside PapyrusWeb, wait a moment',
            []
          );
          setTimeout(function () {
            waitingPopup.close();
          }, 3000);

          await API.createAssigmentPapyrus({
            ctxId: ctx || '',
            assignment_id: actualActivity.data.idUML,
            nomeUtente: WA.player.name,
          })
            .then(async (response) => {
              projectIdPapy = response.data.project_id;
              representationPapy = response.data.representation_id;

              closeWebsite();
              webSite = await WA.nav.openCoWebSite(
                'https://papygame.tech/projects/' +
                  projectIdPapy +
                  '/edit/' +
                  representationPapy +
                  '?ctxId=' +
                  ctx,
                true
              );
            })
            .catch(async (error: any) => {
              console.log(error);
              throw new Error(`HTTP error! Status: ${error.response.status}`);
            });
        } else if (
          actualActivity.platform == 'Collaborative' ||
          actualActivity.platform == 'Eraser'
        ) {
          closeWebsite();
          webSite = await WA.nav.openCoWebSite(
            'https://app.eraser.io/workspace/JVoolrO5JJucnQkr1tK7?origin=share',
            true
          );
        }
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
          'Your next activity is coding assessment. Click Open Notebook to open the notebook directly on your VSCode Editor',
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

    //cheat way to remove point from the player
    WA.room.area.onEnter('cleaningArea').subscribe(() => {
      try {
        triggerMessage = WA.ui.displayActionMessage({
          message:
            "Attention, if you press 'space' or click here to clean your points",
          callback: async () => {
            console.log('deleting point');
            keyMapping.map(async (item) => {
              const playerQuest = await getQuest(item.key);
              console.log(playerQuest);
              if (playerQuest) await levelUp(item.key, -playerQuest.xp);
            });
            console.log('Points removed from the player');
          },
        });

        return;
      } catch (error) {
        console.log(error);
      }
    });

    WA.room.area.onLeave('cleaningArea').subscribe(async () => {
      try {
        triggerMessage.remove();
      } catch (error) {
        console.log(error);
      }
      closeWebsite();
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
