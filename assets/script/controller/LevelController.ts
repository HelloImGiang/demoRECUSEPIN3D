import { _decorator, Component, instantiate, Node, Vec3 } from 'cc';
import { Pin } from '../P/Pin';
import { PathList } from '../P/PathList';
import { ResouceUtils } from '../../utils/ResouceUtils';
import { PlayerController } from '../PlayerController';
import { Configs } from '../../utils/Configs';
const { ccclass, property } = _decorator;

@ccclass('LevelController')
export class LevelController extends Component {
    private winCallback;
    private loseCallback;
    private rayToChildCallback;
    @property({ type: Node })
    private pinList: Node[] = [];
    //
    @property(PathList)
    private pathList: PathList[] = [];
    //
    //point list
    //p1,p2
    //vi tri xp cuar player
    @property(Vec3)
    private playerPos: Vec3 = new Vec3(0, 0, 0);

    private player: PlayerController;
    start() {
        console.log('start cua parent');
    }
    setUp(winCallback,loseCallback) {
        //setup player
        //khoi tao player
        ResouceUtils.loadPrefab(Configs.PLAYER_PREFAB_PATH+'player1', (playerPrefab) => {
            console.log('test');
            let newPlayer: Node = instantiate(playerPrefab);
            this.player = newPlayer.getComponent(PlayerController);
            //set pos
            newPlayer.setPosition(this.playerPos);
            this.node.addChild(newPlayer);
        })

        //
        this.winCallback = winCallback;
        this.loseCallback =loseCallback;
        //setup pin event
        if (this.pinList && this.pinList.length > 0) {
            for (let i = 0; i < this.pinList.length; i++) {
                // console.log('set pin callback')
                this.pinList[i].getComponent(Pin).setUpCallback(()=>{
                    //thong bao cho player
                    this.player.findPath();
                });
            }
        }
    }
    //
    
    //lay list all duong di
    public getPathList(){
        return this.pathList;
    }
    //pass tu Ray to cua GameController vao
    public rayResult(raycastResult) {
        //pass ray vao level cu the (level)
        if (this.rayToChildCallback) {
            this.rayToChildCallback(raycastResult);
        }
    }
    //setup raycast callback from prarent class to extend class
    protected setUpRaycastCallback(parentCallback) {
        this.rayToChildCallback = parentCallback;
    }
    //
    public winLevel() {
        if (this.winCallback) {
            this.winCallback();

        }
    }
    //
    public loseGame() {
        if (this.loseCallback) {
            this.loseCallback();
        }
    }
    // //callback tu con ve cha
    // protected callbackTuConVeCha(callback) {
    //     if (callback) {
    //         callback();
    //     }
    // }
    onDisable() {
        console.log('disable');
    }
    onDestroy() {
        console.log('destroyed');
    }
    //
    update(deltaTime: number) {

    }
}


