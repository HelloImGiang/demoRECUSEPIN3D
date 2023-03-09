import { _decorator, Collider, Component, instantiate, ITriggerEvent, math, Node, RigidBody, SkeletalAnimation, tween, Tween, Vec3 } from 'cc';
import { PathList } from '../P/PathList';
import { Configs } from '../../utils/Configs';
import { PointNode } from '../P/PointNode';
import { PointType } from '../Enum/PointType';
import { LevelController } from './LevelController';
import { Water } from '../W/Water';
const { ccclass, property } = _decorator;

@ccclass('PlayerController')
export class PlayerController extends Component {
    private levelController: LevelController;
    private isFindingPath: boolean = false;
    //
    private selectedPath: PathList = null;
    //
    private pointCount: number = 0;
    //
    @property(SkeletalAnimation)
    private animator: SkeletalAnimation | null = null;
    //
    @property(RigidBody)
    private rigidBody: RigidBody
    //
    @property(Collider)
    private collider: Collider;
    //
    private isOver: boolean = false;
    //bringfloat
    protected isFloat: boolean = false;
    @property({ type: Node })
    protected neckNode: Node;
    //
    protected isJumping: boolean = false;

    start() {
        //get LevelController
        this.levelController = this.node.parent.getComponent(LevelController);
        //di chuyen giua cac diem
        this.collider.on('onTriggerEnter', this.onTriggerEnter, this);
        this.collider.on('onTriggerStay', this.onTriggerStay, this);
        this.scheduleOnce(() => {
            this.findPath();
        }, 1);
    }


    private onTriggerEnter(event: ITriggerEvent) {
        if (this.isOver) return;
        //
        let collisionNode: Node = event.otherCollider.node;
        if (collisionNode.name.includes(Configs.KILL_HUNTER) || collisionNode.name.includes(Configs.KILL_ALL_OBJ)) {
            this.setDie();
        }
        if (collisionNode.name.includes(Configs.FLOAT_NAME)) {
            if (this.isFloat) return;
            this.isFloat = true;
            if (collisionNode.getComponent(RigidBody)) {
                this.attachFloat(collisionNode);
            }
        }
        if (collisionNode.name.includes(Configs.WATER_COLLIDER_NAME)) {
            //neu co phao => chuyen sang animation swim
            if (this.isFloat) {
                this.animator.play('swim');
            } else {
                //die
                this.scheduleOnce(() => {
                    this.setDie();
                }, 1)

            }

        }
    }
    //
    private onTriggerStay(event: ITriggerEvent) {
        if (this.isOver) return;
        if (event.otherCollider.name.includes(Configs.WATER_COLLIDER_NAME) && this.isFloat) {
            //if is jump return: Neu dang jump thi khong set y

            if (!this.isJumping) {
                let yPos = event.otherCollider.node.getParent().getComponent(Water).getWaterFloatY();
                //this.rigidBody.useGravity=false;
                this.node.setPosition(new math.Vec3(this.node.position.x, yPos, this.node.position.z));
            }
        }
    }
    //
    public findPath() {
        //lap qua path list de tim duong
        //
        if (this.isOver) return;
        //neu dang tim duong roi thi khong check tiep
        if (this.isFindingPath) return;
        this.isFindingPath = true;
        //neu dang tim duong roi thi check tiep
        let pathlist = this.levelController.getPathList();
        //
        //loop qua toan bo cac duong di
        for (let i = 0; i < pathlist.length; i++) {
            //lay ra 1 duong di va check xem co the di duoc hay khong
            let pList: PathList = pathlist[i];
            if (pList && this.isPointUnlock(pList)) {
                this.selectedPath = pList;
                this.isFindingPath = true;
                return this.followPath();
            } else {

                this.isFindingPath = false;
            }
        }

    }
    private isPointUnlock(pointList: PathList) {
        //check 1st point of path
        if (!pointList.getPointList()[0].getIsLock()) {
            return true;
        }
        return false;
    }
    //
    private followPath() {
        //check path 0
        this.checkPoint();
    }
    private checkPoint() {
        if (this.isOver) return;
        this.checkPointAndMove(this.selectedPath.getPointList()[this.pointCount]);
    }
    //
    private convertPositionToPlayerY(playerPos, pointPos) {
        return new Vec3(pointPos.x, playerPos.y, 0);
    }
    //
    private checkPointAndMove(pointNode: PointNode) {
        if (pointNode == null) {
            //end of way
            //khi khong tim duoc duong thi set lai

            this.isFindingPath = false
            //reset lai point
            this.pointCount = 0;
            return;
        }
        //point dang lock
        if (pointNode.getIsLock()) {
            this.isFindingPath = false
            return;
        };
        //
        let pointType = pointNode.getPointType();
        switch (pointType) {
            case PointType.walk:
                //let desinationPoint: Vec3 = this.convertPositionToPlayerY(this.node.position, pointNode.getPosition())
                this.run(pointNode, () => {
                    this.pointCount++;
                    this.checkPoint();
                });
                break;
            case PointType.jump:
                this.jump(pointNode, () => {
                    this.pointCount++;
                    this.checkPoint();
                })
                break;

            case PointType.fall:
                this.fall(pointNode, () => {
                    this.pointCount++;
                    this.checkPoint();
                })
                break;

            case PointType.swim:
                //float
                this.swim(pointNode, () => {
                    this.pointCount++;
                    this.checkPoint();
                });
                break;
                case PointType.climb:
                    this.climb(pointNode, () => {
                        this.pointCount++;
                        this.checkPoint();
                    })
    
                    break;
            case PointType.teleout:
                this.teleout(pointNode, () => {
                    this.pointCount++;
                    this.checkPoint();
                })
                break;
            case PointType.telein:
                this.teleIn(pointNode, () => {
                    this.pointCount++;
                    this.checkPoint();
                })
        }
    }
    //
    private run(pointNode: PointNode, finishcallback) {
        //set animation
        let desinationPoint = this.convertPositionToPlayerY(this.node.position, pointNode.getPosition());
        this.animator.play('run');
        //set huong quay mat
        this.node.setRotationFromEuler(pointNode.getDirection())
        tween(this.node).sequence(
            tween(this.node).to(pointNode.getMovingTime(), { worldPosition: desinationPoint }),
            //quay mat huong ra ngoai
            tween(this.node).to(.2, { eulerAngles: new Vec3(0, 90, 0) }),
            tween(this.node).call(() => {
                //         
                this.animator.play('idle')
                //delay 1 khoang 
                this.scheduleOnce(() => {
                    finishcallback();
                }, pointNode.getDelayTime())
            })
        ).start();

    }
    private fall(pointNode: PointNode, finishcallback) {
        //set animation
        this.animator.play('midair');
        this.scheduleOnce(() => {
            //set animation khi roi xuong mat dat
            this.animator.play('idle');
            //delay 1 khoang de doi di den diem tiep theo
            this.scheduleOnce(() => {
                finishcallback();
            }, pointNode.getDelayTime());
        }, pointNode.getMovingTime());


    }
    private jump(pointNode: PointNode, finishcallback) {
        this.animator.play('midair');
        this.node.setRotationFromEuler(pointNode.getDirection());
        this.rigidBody.applyForce(pointNode.getJumpForce());
        this.scheduleOnce(() => {
            //tra ve animation sau khi nhay xong
            this.animator.play('idle');
            //delay 1 khoang cho den point tiep theo
            this.scheduleOnce(() => {
                finishcallback();
            }, pointNode.getDelayTime())
        }, pointNode.getMovingTime())
    }
    private swim(pointNode: PointNode, finishcallback) {
        this.animator.play('swim');
        let desinationPoint = this.convertPositionToPlayerY(this.node.position, pointNode.getPosition());
        tween(this.node).sequence(
            tween(this.node).to(pointNode.getMovingTime(), { worldPosition: desinationPoint }),
            tween(this.node).call(() => {
                finishcallback();
            })
        ).start();
    }
    protected climb(point: PointNode, finishCallback) {
        // this.playJump();
        this.node.setRotationFromEuler(point.getDirection())
        this.animator.play('midair');
         this.scheduleOnce(() => {
             this.isJumping = true;
             this.rigidBody.clearState();
             this.rigidBody.applyForce(point.getJumpForce());
         }, point.getMovingTime());
         this.scheduleOnce(() => {
             this.isJumping = false;
             finishCallback();
         }, point.getDelayTime());
     }
    setDie() {
        this.animator.play('die');
        this.isOver = true;
        //stop all tween
        //
        Tween.stopAllByTarget(this.node);
        //
        this.scheduleOnce(() => {
            this.node.destroy();
        }, 2);
        //
        //delay for a second
        this.scheduleOnce(() => {
            //lose game
            let LevelControllerNode = this.node.getParent();
            if (LevelControllerNode.getComponent(LevelController)) {
                LevelControllerNode.getComponent(LevelController).loseGame();
            }
        }, 1)
    }
    private openDoorSuccess() {
        //win
        //get level manager
        let LevelControllerNode = this.node.getParent();
        if (LevelControllerNode.getComponent(LevelController)) {
            LevelControllerNode.getComponent(LevelController).winLevel();
        }

    }
    private teleIn(pointNode: PointNode, callback: () => void) {
        this.animator.play('midair');
        this.node.setRotationFromEuler(pointNode.getDirection());
        this.node.setPosition(pointNode.getPosition());
        tween(this.node).sequence(
            tween(this.node).call(() => {
                //chuyen = static
                this.rigidBody.isStatic = true;
                this.node.setRotationFromEuler(new Vec3(0, 0, 0));
            }),
            tween(this.node).by(0.5, { position: new Vec3(0, -0.5, 0) }),
            tween(this.node).call(() => {
                this.animator.play('idle');
                callback();
            })
        ).start();
    }
    private teleout(pointNode: PointNode, callback) {
        this.animator.play('midair');
        this.node.setRotationFromEuler(pointNode.getDirection());
        this.node.setPosition(pointNode.getPosition());
        tween(this.node).sequence(
            //di len
            tween(this.node).by(0.5, { position: new Vec3(0, 0.5, 0) }),
            tween(this.node).call(() => {
                //chuyen = dynamic
                this.rigidBody.isDynamic = true;
            }),
            tween(this.node).call(() => {
                this.animator.play('idle');
                //
                this.scheduleOnce(() => {
                    callback();
                }, pointNode.getDelayTime());
            })
        ).start();
    }
    //bring float
    private attachFloat(float: Node) {
        //remove float cu va tao 1 float moi gan vao player (de loai bo rigidbody,collider..)
        let newFloat = instantiate(float.getChildByName('float'));
        this.neckNode.addChild(newFloat);

        newFloat.setPosition(new math.Vec3(0, 0, 0));
        newFloat.setRotationFromEuler(new math.Vec3(0, 90, 0));
        //huy float cu
        float.destroy();
    }
    public getIsFloat() {
        return this.isFloat;
    }
}
