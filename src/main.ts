/// <reference types="@workadventure/iframe-api-typings" />

import { bootstrapExtra } from '@workadventure/scripting-api-extra';
import { API } from './data/api';
import { ActionMessage } from '@workadventure/iframe-api-typings';
import { getQuest, levelUp } from '@workadventure/quests';
import { AnalyticsActionBody, keyMapping } from './types/PolyglotFlow';
//import { messagesPopup } from './components/userInteraction';

console.log('Script started successfully');

let webSite: any = undefined;
let wrongPopup: any = undefined;
let instructionPopup: any = undefined;
//let narrativePopup: any = undefined;
let road: { x: number; y: number }[] = [{ x: 0, y: 0 }];
let roadRun: Boolean = false;
let triggerMessage: ActionMessage;

const mappingActivity = [
  {
    activity: ['FlowsMenu', 'MoveToOrg'],
    pos: {
      x: 23,
      y: 6,
    },
    message:
      'Go to the selection room and access the Select Menus or go take the stairs to enter the execution world.',
  },
  {
    activity: ['Gym'],
    pos: {
      x: 23,
      y: 40,
    },
    message: 'Go to the gym and access our training system.',
  },
  {
    activity: ['CreateLP'],
    pos: {
      x: 16,
      y: 40,
    },
    message: 'Go to the creative room and create your own learing path.',
  },
  {
    activity: ['Socialize', 'Library'],
    pos: {
      x: 13,
      y: 17,
    },
    message:
      'Meet your friends in the social hub or study in the library while waiting them.',
  },
  {
    activity: ['Leaderboard'],
    pos: {
      x: 16,
      y: 52,
    },
    message: "Check the leaderboards, your rivals don't wait you.",
  },
  {
    activity: ['Meeting'],
    pos: {
      x: 26,
      y: 30,
    },
    message: 'Come meet us inside the meeting room.',
  },
];

function closeWebsite() {
  if (webSite !== undefined) {
    webSite.close();
    webSite = undefined;
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

function clearRoad() {
  //refactor: si potrebbe fare in modo che al posto di cancellarli tutti cancella solo il primo creato (più vicino al player) e ne aggiunge uno in fondo
  //=> codice più veloce e leggero in runtime
  let toCancel;
  do {
    toCancel = road.pop();
    if (toCancel)
      WA.room.setTiles([
        {
          x: toCancel.x,
          y: toCancel.y,
          tile: null,
          layer: 'arrows/Type2',
        },
      ]);
  } while (toCancel);
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

let nextPos = { x: 0, y: 0 };

async function suggestionBanner(areaPopup: string) {
  //refactor banner for entryPoint map
  closePopup();
  roadRun = true;
  const playerSuggestion =
    (WA.player.state.suggestion as string) || 'FlowsMenu';
  let message;

  mappingActivity.map((map) => {
    if (map.activity.includes(playerSuggestion)) {
      nextPos = { x: map.pos.x, y: map.pos.y + 2 };
      WA.room.setTiles([
        {
          x: map.pos.x,
          y: map.pos.y,
          tile: 'arrowBase',
          layer: 'arrows/Type1',
        },
      ]);
      message = map.message;
    }
  });
  if (areaPopup == 'InitBanner') message = 'Welcome in our World.\n' + message;
  wrongPopup = WA.ui.openPopup(areaPopup, message || 'Error Text', [
    {
      label: 'Close',
      className: 'normal',
      callback: () => {
        // Close the popup when the "Close" button is pressed.
        closePopup();
      },
    },
  ]);
  setTimeout(function () {
    closePopup();
  }, 3000);

  if (!roadRun) return;

  let actualPos = await WA.player.getPosition();

  clearRoad();
  roadRun = true;
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
        const tilePosY = actualPos.y + (actualPos.y < nextPos.y ? 2 : -2) + 1;

        WA.room.setTiles([
          {
            x: tilePosX,
            y: tilePosY,
            tile: 'pointerBase',
            layer: 'arrows/Type2',
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
            layer: 'arrows/Type2',
          },
        ]);
        road.push({ x: tilePosX, y: tilePosY });
        actualPos = { x: tilePosX, y: tilePosY };
      }
    } while (again && i < 20);
}

WA.player.onPlayerMove(async () => {
  //processChange();

  if (nextPos.x == 0) return; //means has no next edge
  clearRoad();
  if (!roadRun) return; //no display needed

  let actualPos = await WA.player.getPosition();
  actualPos = {
    x: Math.floor(actualPos.x / 33),
    y: Math.floor(actualPos.y / 33) - 1,
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
            layer: 'arrows/Type2',
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
            layer: 'arrows/Type2',
          },
        ]);
        road.push({ x: tilePosX, y: tilePosY });
        actualPos = { x: tilePosX, y: tilePosY };
      }
    } while (again && i < 20);
});

/*
let startingMeetingTime: Date;

WA.player.proximityMeeting.onJoin().subscribe(async () => {
  startingMeetingTime = new Date();
});

WA.player.proximityMeeting.onLeave().subscribe(async () => {
  const endMeetingTime = new Date();
  const milliDiff: number =
    endMeetingTime.getTime() - startingMeetingTime.getTime();

  const totalPoints = Math.floor(Math.floor(milliDiff / 1000) / 60) * 10;
  const keyEvent =
    WA.player.state.actualFlow == '6c7867a1-389e-4df6-b1d8-68250ee4cacb'
      ? 'challenge45Aquila2025'
      : 'challenge23Aquila2025';
  if (
    WA.player.state.actualFlow == '6c7867a1-389e-4df6-b1d8-68250ee4cacb' ||
    WA.player.state.actualFlow == '6614ff6b-b7eb-423d-b896-ef994d9af097'
  )
    levelUp(keyEvent, totalPoints);
});
*/
/*
function debounce(func: (...args: any[]) => void, timeout = 2000) {
  let timer: ReturnType<typeof setTimeout>;
  return (...args: any[]) => {
    clearTimeout(timer);
    timer = setTimeout(() => func(...args), timeout);
  };
}

function saveInput() {
  const keyEvent =
    WA.player.state.actualFlow == '6c7867a1-389e-4df6-b1d8-68250ee4cacb'
      ? 'challenge45Aquila2025'
      : 'challenge23Aquila2025';
  if (
    WA.player.state.actualFlow == '6c7867a1-389e-4df6-b1d8-68250ee4cacb' ||
    WA.player.state.actualFlow == '6614ff6b-b7eb-423d-b896-ef994d9af097'
  )
    levelUp(keyEvent, 1);
}

const processChange = debounce(saveInput, 3000);*/

function registerAnalyticsAction<T extends AnalyticsActionBody>( //modificare per le action dell'entryPoint
  action: T
): void {
  if ('actionType' in action) {
    switch (action.actionType) {
      case 'gradeAction':
        if (!('flow' in action.action && 'grade' in action.action)) {
          throw new Error('Invalid GradeAction structure');
        }
        break;
      default:
        throw new Error(`Unknown actionType: ${action.actionType}`);
    }
  }
  API.registerAction(action);
}

// Waiting for the API to be ready
WA.onInit()
  .then(async () => {
    suggestionBanner('InitBanner');
    WA.room.hideLayer('roof');
    if (WA.player.playerId == 0o1 || WA.player.playerId == 0o0)
      //vedi il nostro playerId-> cerca tmao e bucc
      WA.room.hideLayer('collision_manager_door');
    console.log('Scripting API ready');
    WA.room.showLayer('PapyrusWebIcon');
    WA.room.hideLayer('CollaborativeIcon');
    // Flows Menu
    WA.room.website.create({
      name: 'logo',
      url: './images/solo_logo_32.png',
      position: {
        x: 464,
        y: 464,
        width: 64,
        height: 64,
      },
      visible: true,
      origin: 'map',
      scale: 1,
    });
    WA.room.website.create({
      name: 'logo2',
      url: './images/solo_logo_32.png',
      position: {
        x: 785,
        y: 464,
        width: 64,
        height: 64,
      },
      visible: true,
      origin: 'map',
      scale: 1,
    });
    displayMainDoor();
    WA.player.playerId;
    WA.room.website.create({
      name: 'scritta',
      url: './images/solo_scritta_32.png',
      position: {
        x: 541,
        y: 704,
        width: 418,
        height: 64,
      },
      visible: true,
      origin: 'map',
      scale: 1,
    });
    //narrativeMessage();
    WA.room.area.onLeave('Outside').subscribe(async () => {
      roadRun = false;
      WA.room.showLayer('roof');
      clearRoad();
    });

    WA.room.area.onLeave('Outside2').subscribe(async () => {
      WA.room.showLayer('roof');
    });

    WA.room.area.onEnter('Entry').subscribe(async () => {
      try {
        WA.room.hideLayer('roof');
        closeInstruction();

        suggestionBanner('EntryBanner');
      } catch (error) {
        // Handle errors if the API call fails
        console.error('Failed to get API response:', error);
      }
    });
    WA.room.area.onEnter('Entry2').subscribe(async () => {
      //dalla entry 2 (basso) bisogna dare l'indicazione per salire
      try {
        WA.room.hideLayer('roof');
        closeInstruction();
        suggestionBanner('EntryBanner2');
      } catch (error) {
        // Handle errors if the API call fails
        console.error('Failed to get API response:', error);
      }
    });

    WA.room.area.onEnter('FlowsMenu').subscribe(async () => {
      try {
        roadRun = false;
        WA.room.setTiles([
          {
            x: 23, // da cambiare per mondo execution
            y: 8,
            tile: null,
            layer: 'arrows/Type1',
          },
        ]);
        wrongPopup = await WA.ui.openPopup(
          'MenuBanner',
          'Here you can choose which learning path you want to do, access the console to see the possibilities',
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
      suggestionBanner('MenuBanner');
      closeWebsite();
    });

    WA.room.area.onEnter('activityManager').subscribe(async () => {
      try {
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

    //gym room
    WA.room.area.onEnter('GymRoom').subscribe(async () => {
      // If you need to send data from the first call
      roadRun = false;
      try {
        console.log('gymRoom');
        closePopup();
        wrongPopup = WA.ui.openPopup(
          'GymBanner',
          'This is the gym, soon you will be able to train your skills through tailored activities generated from our AI system just for you.',
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
      } catch (error) {
        // Handle errors if the API call fails
        console.error('Failed to get API response:', error);
      }
    });

    WA.room.area.onLeave('GymRoom').subscribe(async () => {
      suggestionBanner('GymBanner');
    });

    WA.room.area.onEnter('creativeRoom').subscribe(async () => {
      // If you need to send data from the first call
      roadRun = false;
      try {
        console.log('creativeRoom');
        closePopup();
        wrongPopup = WA.ui.openPopup(
          'CreativeBanner',
          'This room is a creative area, here you can access the Learning Path editor to create your personal path',
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
      } catch (error) {
        // Handle errors if the API call fails
        console.error('Failed to get API response:', error);
      }
    });

    WA.room.area.onLeave('creativeRoom').subscribe(async () => {
      suggestionBanner('CreativeBanner');
    });

    // creativeArea
    WA.room.area.onEnter('creativeArea').subscribe(async () => {
      // If you need to send data from the first call
      try {
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
      closeWebsite();
    });

    WA.room.area.onEnter('instructions').subscribe(() => {
      try {
        try {
          triggerMessage.remove();
        } catch (error) {
          console.log(error);
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
      suggestionBanner('InstructionBanner');
      closeWebsite();
    });

    WA.room.area.onEnter('SocialPoint').subscribe(async () => {
      // If you need to send data from the first call
      roadRun = false;
      try {
        closePopup();
        wrongPopup = WA.ui.openPopup(
          'SocialBanner',
          'This is the social hub, meet your friends and find new ones, or study quietly in the library.',
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
      } catch (error) {
        // Handle errors if the API call fails
        console.error('Failed to get API response:', error);
      }
    });

    WA.room.area.onLeave('SocialPoint').subscribe(async () => {
      suggestionBanner('SocialBanner');
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
