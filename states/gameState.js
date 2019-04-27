function createRectangle(x,y,width,height,color,opacity=1) {
    var tempGraphics = game.add.graphics(0,0);
        tempGraphics.beginFill(color,opacity);
        tempGraphics.drawRect(x,y,width,height);
        tempGraphics.endFill();
    var tempSprite = game.add.sprite(x,y,tempGraphics.generateTexture());
    tempGraphics.destroy();
    return tempSprite;
}
function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}
function checkOverlap(spriteA, spriteB) {
    var boundsA = spriteA.getBounds();
    var boundsB = spriteB.getBounds();
    return Phaser.Rectangle.intersects(boundsA, boundsB);
}
function canFoodKingMove(sprite) {
    if (sprite.x < 320 || (sprite.x + sprite.width) > (CANVAS_WIDTH)) return false;
    if (sprite.y < 0 || sprite.y + sprite.height > (CANVAS_HEIGHT - 100)) return false;
    return true;
}

function createFoodCitizen(type,x=getRandomInt(320,600),y=getRandomInt(0,360),size=16) {
    var mySprite = null;
    switch (type) {
        case foodTypes.CARBS:
        mySprite = createRectangle(x,y,size,size,0x55FF88);
        break;
        case foodTypes.PROTEIN:
        mySprite = createRectangle(x,y,size,size,0xFFEE22);
        break;
        case foodTypes.FATS:
        mySprite = createRectangle(x,y,size,size,0xFF6666);
        break;
        case foodTypes.ALCOHOL:
        mySprite = createRectangle(x,y,size,size,0xFFFFFF);
        break;
    }
    mySprite.foodType = type;
    return mySprite;
}
function createRandomFoodCitizen() {
    return createFoodCitizen(getRandomInt(0,3));
}
function createHeadRow(size=4) {
    var row = [];
    for (var i = 0; i < size; i++) {
        row.push(createFoodCitizen(getRandomInt(0,3),16+(80*i),0,32));
    }
    return row;
}

const foodTypes = {
    CARBS : 0,
    PROTEIN : 1,
    FATS : 2,
    ALCOHOL : 3,
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
    inputButtonStockMap : {},
    inputButtonColumnMap : null,
    leftKeyList : [],
    foodCitizens : [],
    stockedFood : [],
    heads: [],

    getFirstHeadForColumn : function(column) {
        for (var i  = 0; i < this.heads.length;i++) {
            row = this.heads[i];
            if (row[column] != null) return row[column];
        }
        return null;
    },
    checkHeadDamage : function(myKey,type) {
        var columnIndex = this.inputButtonColumnMap[myKey];
        if (columnIndex != null && this.heads.length > 0) {
            var head = this.getFirstHeadForColumn(columnIndex);
            if (head != null && head.foodType == type) {
                head.destroy();
                this.heads[0][columnIndex] = null;
            }
            else {
                //Sad day;
            }
        }
    },
    fireStock : function() {
        for (var key in this.inputButtonStockMap) {
            const stock = this.inputButtonStockMap[key];
            const myKey = key;
            if (stock != null) {
                var myTween = game.add.tween(stock);
                myTween.to({y:-32},150,Phaser.Easing.Linear.None);
                myTween.onComplete.add(function() {
                    this.checkHeadDamage(myKey,stock.foodType);
                    stock.destroy();
                    gameState.inputButtonStockMap[myKey] = null;
                },this);
                myTween.start();
            }
        }
    },
    popStock : function() {
        var stock = null;
        if (this.stockedFood.length > 0) {
            stock = this.stockedFood.splice(0,1);
        }
        for (var i = 0; i < this.stockedFood.length; i++) {
            var myStock = this.stockedFood[i];
            this.stockedFood[i].x = 332+(i*20);
            this.stockedFood[i].y = 426;
            this.stockedFood[i].alpha = (i > 13) ? 0 : 1;
        }
        return stock;
    },
    pushNewRow : function(size=4) {
        this.heads.push(createHeadRow(size));
        for (var i = 0; i < this.heads.length; i++) {
            var row = this.heads[i];
            for (var head of row) {
                
                if (head != null) head.y = ((this.heads.length -1) - i) * 80;
            }
        }
    },
    create : function() {
        game.stage.backgroundColor = "#4488AA";

        var sidePanel = createRectangle(0,0,320,380,0x000000);
        var inputPanel = createRectangle(0,380,640,100,0x444444);
        
        this.foodKingSprite = createRectangle(380,240,32,32,0xFFF5555);

        


        this.keyUp = game.input.keyboard.addKey(Phaser.Keyboard.UP);
        this.keyDown = game.input.keyboard.addKey(Phaser.Keyboard.DOWN);
        this.keyLeft = game.input.keyboard.addKey(Phaser.Keyboard.LEFT);
        this.keyRight = game.input.keyboard.addKey(Phaser.Keyboard.RIGHT);
        this.spaceKey = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);

        this.keyQ = game.input.keyboard.addKey(Phaser.Keyboard.Q);
        this.keyW = game.input.keyboard.addKey(Phaser.Keyboard.W);
        this.keyE = game.input.keyboard.addKey(Phaser.Keyboard.E);
        this.keyR = game.input.keyboard.addKey(Phaser.Keyboard.R);

        

        this.leftKeyList = [this.keyQ, this.keyW, this.keyE, this.keyR];

        for (var key of this.leftKeyList) {
           key.onDown.add(function(key) {
                this.inputButtonSpriteMap[key.keyCode].alpha = 0.5;
                if (this.inputButtonStockMap[key.keyCode] == null) {
                    var stock = this.popStock();
                    if (stock != null) {
                        stock = stock[0];
                        this.inputButtonStockMap[key.keyCode] = stock;
                        stock.x = this.inputButtonSpriteMap[key.keyCode].x;
                        stock.y = this.inputButtonSpriteMap[key.keyCode].y;
                    }
                }
           },this);
           key.onUp.add(function(key) {
            this.inputButtonSpriteMap[key.keyCode].alpha = 1;
       },this);
        }

        this.spaceKey.onDown.add(function(key) {
            this.inputButtonSpriteMap["SPACE"].alpha = 0.5;
            gameState.fireStock();
        },this);
        this.spaceKey.onUp.add(function(key) {
            this.inputButtonSpriteMap["SPACE"].alpha = 1;
        },this);

        this.inputButtonSpriteMap = {
            "81" : createRectangle(16,388,64,64,0x7722FF),
            "87" : createRectangle(88,388,64,64,0x7722FF),
            "69" : createRectangle(164,388,64,64,0x7722FF),
            "82" : createRectangle(236,388,64,64,0x7722FF),
            "SPACE" : createRectangle(8,456, 304, 16, 0x7722FF),
        }
        this.inputButtonStockMap = {
            "81" : null,
            "87" : null,
            "69" : null,
            "82" : null,
        }
        this.inputButtonColumnMap = {
            "81" : 0,
            "87" : 1,
            "69" : 2,
            "82" : 3,
        }
        this.foodCitizens.push(createRandomFoodCitizen());
        this.foodCitizens.push(createRandomFoodCitizen());
        this.foodCitizens.push(createRandomFoodCitizen());
        this.foodCitizens.push(createRandomFoodCitizen());
        this.foodCitizens.push(createRandomFoodCitizen());

        timer = game.time.create(false);
        timer.loop(5000, ()=>{gameState.headPusher();}, this);
        timer.start();
    },
    headPusher: function() {
        gameState.pushNewRow(getRandomInt(1,4));
    },
    update : function() {
        if (game.input.mousePointer.isDown) {
            console.log({x:game.input.mousePointer.x, y: game.input.mousePointer.y});
        }
        
        if (this.foodCitizens.length < 5) {
            this.foodCitizens.push(createRandomFoodCitizen());
        }

        var tempPos = {x: this.foodKingSprite.x, y:this.foodKingSprite.y, width: this.foodKingSprite.width, height: this.foodKingSprite.height};
        if (this.keyUp.isDown) {
            tempPos.y-=2;
        }
        else if (this.keyDown.isDown) {
            tempPos.y+=2;
        }

        if (this.keyLeft.isDown) {
            tempPos.x-=2;
        }
        else if (this.keyRight.isDown) {
            tempPos.x+=2;
        }
        if (canFoodKingMove(tempPos)) {
            this.foodKingSprite.x = tempPos.x;
            this.foodKingSprite.y = tempPos.y;
        }
        var staying = [];
        for (var citizen of this.foodCitizens) {
            if (checkOverlap(this.foodKingSprite, citizen)) {
                var stock = this.stockedFood.length;
                var item = (createFoodCitizen(citizen.foodType,332+(stock*20),426));
                this.stockedFood.push(item);
                if (stock > 13) item.alpha = 0;
                citizen.destroy();
            }
            else staying.push(citizen);
        }
        this.foodCitizens = staying;
    }
}