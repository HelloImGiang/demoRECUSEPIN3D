import { _decorator } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('Configs')
export class Configs {
    //
    //public static 
    //string constant
    public static DOOR_NAME:string ='Door';
    public static PIN_NAME: string = 'pin';
    public static LOAD_LEVEL_PATH = 'level/lv';
    public static PLAYER_PREFAB_PATH = 'character/';
    public static SPIKE_PREFABS:string = 'Spike'
    public static KILL_PLAYER_OBJ:string= 'hunter';
    public static KILL_ALL_OBJ:string = 'obj_kill_all';
    public static FLOOR_GROUND_NAME:string = 'floor';
    public static PLAYER_NAME:string = 'player';
    public static FLOAT_PREFAB_PATH = 'items/';
    public static FLOAT_NAME:string = 'float';
    public static WATER_COLLIDER_NAME:string = 'Water'

    //water jump force
    public static WATER_JUMP_FORCE:number = 10;
}


