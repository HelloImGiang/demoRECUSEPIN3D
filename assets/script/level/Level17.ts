import { _decorator, Component, Node } from 'cc';
import { LevelController } from '../controller/LevelController';
import { Pin } from '../P/Pin';
import { Configs } from '../../utils/Configs';
const { ccclass, property } = _decorator;

@ccclass('Level17')
export class Level17 extends LevelController {
    start() {
        //set up parent raycast callback
        this.setUpRaycastCallback((rayData) => {
            for (let i = 0; i < rayData.length; i++) {
                console.log('ray', rayData[i].collider.node.name);
                this.rayToNode(rayData[i].collider.node)
            }
        })       
    }

    private rayToNode(whichNode: Node) {
        if (whichNode.name.includes(Configs.PIN_NAME)) {
            //pull the pin
            whichNode.getComponent(Pin).onTouchMe();
        }
    }

}
