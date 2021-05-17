import { createMachine, interpret, Machine, actions, Interpreter } from 'xstate';
import { SpeciesName } from 'utils/SpeciesName';

const {assign, send} = actions;

export enum GameMode {
    DamagingEnemy = 'enemyBeingDamaged',
    DamagingUser = 'userBeingDamaged',
    DamagedUser = 'userDamaged',
    DamagedEnemy = 'enemyDamaged',
    FaintingEnemy = 'enemyFainted',
    FaintingUser = 'userFainted',
    AwardingItems = 'awardingItems',
    WipingOut = 'wipingOut',
    UsingDialog = 'usingDialog',
    SelectingStarter = 'selectingStarter',
    SelectedStarter = 'selectedStarter',
    EncounteringWildPokemon = 'encounteringWildPokemon',
    RewardUser = 'rewardUser',
    ReplaceUser = 'replaceUser',
}

export const isStarterMode = (g: GameMode) => GameMode.SelectedStarter === g || GameMode.SelectingStarter === g;
export const isInBattle = (g: GameMode) => GameMode.DamagedEnemy === g || GameMode.DamagedUser === g ||
    GameMode.DamagingEnemy === g || GameMode.DamagingUser === g || GameMode.EncounteringWildPokemon === g;

export enum MachineType {
    Core = 'core',
    Battle = 'battle',
}

export const battleMachine = createMachine({
    id: MachineType.Battle,
    initial: GameMode.EncounteringWildPokemon,
    states: {
        [GameMode.EncounteringWildPokemon]: {
            on: {
                DAMAGE_ENEMY: GameMode.DamagingEnemy,
            }
        },
        // [GameMode.DamagingEnemy]: {
        //     on: {
        //         [GameMode.DamagedEnemy]: GameMode.DamagingUser,
        //     }
        // },
        // [GameMode.DamagingUser]: {
        //     on: {
        //         [GameMode.DamagedUser]: GameMode.DamagingEnemy,
        //     }
        // }
    }
});

export interface CoreStateSchema {
    states: {
        [GameMode.SelectingStarter]: {};
        [GameMode.SelectedStarter]: {
            states: {
                [GameMode.EncounteringWildPokemon]: {
                    states: {
                        [GameMode.DamagingEnemy]: {};
                    };
                };
            };
        };
        [GameMode.EncounteringWildPokemon]: {};
        [GameMode.DamagingEnemy]: {};
        [GameMode.DamagedEnemy]: {};
        [GameMode.DamagingUser]: {};
        [GameMode.DamagedUser]: {};
        [GameMode.RewardUser]: {};
        [GameMode.ReplaceUser]: {};
    };
}

export type CoreStateEvent =
    | { type: 'STARTER_SELECTION'; selection: SpeciesName  }
    | { type: 'START_ENCOUNTER'; selection: SpeciesName }
    | { type: 'BATTLE'; damage: number }
    | { type: 'KNOCKED_OUT' }
;

export interface CoreStateContext {
    starter: SpeciesName | null;
    damage: number;
}

export const coreMachine = Machine<CoreStateContext, CoreStateSchema, CoreStateEvent>({
    id: MachineType.Core,
    initial: GameMode.SelectingStarter,
    context: {
        starter: null,
        damage: 0,
    },
    states: {
        [GameMode.SelectingStarter]: {
            on: {
                STARTER_SELECTION: {
                    target: GameMode.SelectedStarter,
                    actions: assign({
                        starter: (_, event) => {
                            console.log('Selecting Starter...');
                            return event.selection;
                        }
                    })
                },
            },
        },
        [GameMode.SelectedStarter]: {
            on: {
                STARTER_SELECTION: {
                    target: GameMode.SelectedStarter,
                    actions: [
                        assign({
                            starter: (_, event) => {
                                console.log('Selecting Starter...');
                                return event.selection;
                            }
                        }),
                        //send(GameMode.EncounteringWildPokemon)
                    ],
                },
                START_ENCOUNTER: GameMode.EncounteringWildPokemon
            },

            //...battleMachine,
        },
        [GameMode.EncounteringWildPokemon]: {
            on: {
                BATTLE: {
                    target: GameMode.DamagingEnemy,
                    actions: [
                        assign({
                            damage: (_, event) => {
                                return event.damage;
                            }
                        })
                    ]
                },
            }
        },
        [GameMode.DamagingEnemy]: {
            on: {
                BATTLE: GameMode.DamagedEnemy,
            }
        },
        [GameMode.DamagedEnemy]: {
            on: {
                BATTLE: GameMode.DamagingUser,
                KNOCKED_OUT: GameMode.RewardUser,
            }
        },
        [GameMode.DamagingUser]: {
            on: {
                BATTLE: GameMode.DamagedUser,
            }
        },
        [GameMode.DamagedUser]: {
            on: {
                BATTLE: GameMode.DamagingEnemy,
                KNOCKED_OUT: GameMode.ReplaceUser,
            }
        },
        [GameMode.ReplaceUser]: {},
        [GameMode.RewardUser]: {},
        
    }
});


export const coreService: Interpreter<CoreStateContext, CoreStateSchema, CoreStateEvent> = interpret(coreMachine)
    .onTransition(state => console.log(state.value, state.actions, state.context))
    .start();
