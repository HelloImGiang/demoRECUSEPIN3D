import { _decorator, Component, Node, tween, Vec3 } from 'cc';
import { PointNode } from './PointNode';
const { ccclass, property } = _decorator;
enum DIRECTION{
    left = 1,
    right = 2,
    up = 3,
    down = 4
}
@ccclass('Pin')
export class Pin extends Component {
    isMove:boolean=false;
    @property   
    direction:DIRECTION = DIRECTION.left;
    @property(Node)
    private attachPathNode:Node;
    callbackToLevel;
    // check 
    //set các trường hợp của pin
    //setup callback
    setUpCallback(callbackToLevel){
        console.log('setup');
        this.callbackToLevel = callbackToLevel;
    }
    //

    onTouchMe(){
        console.log('test')
        if(this.isMove)
        return;
        this.isMove = true;
        let hoz = 0;
        let ver = 0;
        switch (this.direction){
            case DIRECTION.left:
                hoz = 3;
                break;
            case DIRECTION.right:
                hoz = -3;
                break;
            case DIRECTION.up:
                ver = 3 ;
                break;
            case DIRECTION.down:
                ver = -3 ;
                break;                        
        }
        tween(this.node).sequence(
            tween(this.node).by(0.3,{position:new Vec3(hoz,ver,0)}),
            tween().call(()=>{
                //unlock path ma duoc gan voi pin hien tai
                if(this.attachPathNode){
                    this.attachPathNode.getComponent(PointNode).setUnlock();
                    //thong bao cho level mo pin => player check path
                    this.callbackToLevel();
                }
                //destroy
                this.node.destroy();
            })
        ).start();
    }
}


