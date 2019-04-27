function createRectangle(x,y,width,height,color,opacity=1) {
    var tempGraphics = game.add.graphics(0,0);
        tempGraphics.beginFill(color,opacity);
        tempGraphics.drawRect(x,y,width,height);
        tempGraphics.endFill();
    var tempSprite = game.add.sprite(x,y,tempGraphics.generateTexture());
    tempGraphics.destroy();
    return tempSprite;
}

function toRightPanelCoords(pos) {
    return {x:pos.x-320,y:pos.y};
}

var gameState = {
    mySprite : null,
    lastPoint : {},
    keyQ : null,
    keyW : null,
    keyE : null,
    keyR : null,
    inputButtonSpriteMap : null,
    leftKeyList : [],

    
    create : function() {
        game.stage.backgroundColor = "#4488AA";

        var sidePanel = createRectangle(0,0,320,380,0x000000);
        var inputPanel = createRectangle(0,380,640,100,0xFFFF11);
        
        this.foodKingSprite = createRectangle(380,240,32,32,0xFFF5555);

       


        this.keyUp = game.input.keyboard.addKey(Phaser.Keyboard.UP);
        this.keyDown = game.input.keyboard.addKey(Phaser.Keyboard.DOWN);
        this.keyLeft = game.input.keyboard.addKey(Phaser.Keyboard.LEFT);
        this.keyRight = game.input.keyboard.addKey(Phaser.Keyboard.RIGHT);
        this.spaceKey = game.input.keyboard.addKey(Phaser.Keyboard.SPACE);

        this.keyQ = game.input.keyboard.addKey(Phaser.Keyboard.Q);
        this.keyW = game.input.keyboard.addKey(Phaser.Keyboard.W);
        this.keyE = game.input.keyboard.addKey(Phaser.Keyboard.E);
        this.keyR = game.input.keyboard.addKey(Phaser.Keyboard.R);

        this.leftKeyList = [this.keyQ, this.keyW, this.keyE, this.keyR];

        this.inputButtonSpriteMap = {
            "81" : createRectangle(16,388,64,64,0x7722FF),
            "87" : createRectangle(88,388,64,64,0x7722FF),
            "69" : createRectangle(164,388,64,64,0x7722FF),
            "82" : createRectangle(236,388,64,64,0x7722FF),
            "SPACE" : createRectangle(8,456, 304, 16, 0x7722FF),
        }
    },

    update : function() {
        if (game.input.mousePointer.isDown) {
            console.log({x:game.input.mousePointer.x, y: game.input.mousePointer.y});
        }
        for (var key of this.leftKeyList) {
            if (key.isDown) {
                if (this.inputButtonSpriteMap[key.keyCode] != null) {
                    this.inputButtonSpriteMap[key.keyCode].alpha = 0.5;
                }
            }
            else {
                if (this.inputButtonSpriteMap[key.keyCode] != null) {
                    this.inputButtonSpriteMap[key.keyCode].alpha = 1;
                }
            }
        }

        if (this.keyUp.isDown) {
            this.foodKingSprite.y-=2;
        }
        else if (this.keyDown.isDown) {
            this.foodKingSprite.y+=2;
        }

        if (this.keyLeft.isDown) {
            this.foodKingSprite.x-=2;
        }
        else if (this.keyRight.isDown) {
            this.foodKingSprite.x+=2;
        }
    }
}