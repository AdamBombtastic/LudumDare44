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
function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
      let j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
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
    if (size == 4) {
        for (var i = 0; i < size; i++) {
            row.push(createFoodCitizen(getRandomInt(0,3),16+(80*i),0,32));
        }
    }
    else {
        for (var i = 0; i < 4; i++) {
            if (i < size) row.push(createFoodCitizen(getRandomInt(0,3),16+(80*i),0,32));
            else {
               row.push(null);
            }
        }
       shuffle(row);
       for (var i = 0; i < 4; i++) {
           var temp = row[i];
           if (temp != null) {
               temp.x = 16+(80*i);
               temp.y = 0;
           }
       }
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
            if (row[column] != null && row[column].alive){
                return row[column];
            } 
        }
        console.log("Returning null");
        return null;
    },
    checkSpecialDamage : function() {
        var fireMap = this.inputButtonStockMap;
        var success = true;
        for (var key in fireMap) {
            if (key != null && fireMap[key] != null) {
                var type = fireMap[key].foodType;
                success = success & this.checkHeadDamage(key,type);
            }
            else if (key == "SPACE") continue;
            else success = false;
        }
        if (success) {
            //clear rows;
            for (var i = 0; i < this.heads.length; i++) {
                for (var j = 0; j < this.heads[i].length; j++) {
                    var head = this.heads[i][j];
                    if (head != null) head.destroy();
                }
            }
            this.heads = [];
            console.log("Got em all");
        }
    },
    checkHeadDamage : function(myKey,type) {
        var columnIndex = this.inputButtonColumnMap[myKey];
        if (columnIndex != null && this.heads.length > 0) {
            var head = this.getFirstHeadForColumn(columnIndex);
            if (head != null && head.foodType == type) {
                head.destroy();
                this.heads[0][columnIndex] = null;
                return true;
            }
            else {
                
            }
        }
        return false;
    },
    fireStock : function() {
        for (var key in this.inputButtonStockMap) {
            const stock = this.inputButtonStockMap[key];
            const myKey = key;
            var addedCheck = false;
            if (stock != null) {
                var myTween = game.add.tween(stock);
                myTween.to({y:-32},150,Phaser.Easing.Linear.None);
                if (!addedCheck) {
                    myTween.onComplete.add(function() {
                        this.checkSpecialDamage();
                        stock.destroy();
                        gameState.inputButtonStockMap[myKey] = null;
                    },this);
                    addedCheck = true;
                }
                else {
                    myTween.onComplete.add(function() {
                        //this.checkHeadDamage(myKey,stock.foodType);
                        stock.destroy();
                        gameState.inputButtonStockMap[myKey] = null;
                    },this);
                }
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
    addFoodStock : function(type) {
        var stock = this.stockedFood.length;
        var item = (createFoodCitizen(type,332+(stock*20),426));
        this.stockedFood.unshift(item);
        if (stock > 13) item.alpha = 0;
        for (var i = 0; i < this.stockedFood.length; i++) {
            var myStock = this.stockedFood[i];
            this.stockedFood[i].x = 332+(i*20);
            this.stockedFood[i].y = 426;
            this.stockedFood[i].alpha = (i > 13) ? 0 : 1;
        }
    },
    create : function() {
        game.stage.backgroundColor = "#4488AA";

        var sidePanel = createRectangle(0,0,320,380,0x000000);
        var inputPanel = createRectangle(0,380,640,100,0x444444);

       
        var fatSection = createRectangle(340,0,280,80,0xFF6666);
        var alcoholSection = createRectangle(340,300,280,80,0xFFFFFF);

        var proteinSection = createRectangle(560,20,80,280,0xFFEE22);
        var carbSection = createRectangle(320,20,80,280,0x55FF88);  
        
        this.foodKingSprite = game.add.sprite(240,240,"spr_foodKing");//createRectangle(240,240,32,32,0xFFF5555);
        this.foodKingSprite.scale.setTo(2,2);
        this.foodKingSprite.centerX = (320 + (320/2));
        this.foodKingSprite.centerY = 190 - 16;
        this.foodKingSprite.isLeft = false;
        this.foodKingSprite.isUp = false;

        const foodKingStartX = (320 + (320/2));
        const foodKingStartY = 190 - 16;
        


        this.keyUp = game.input.keyboard.addKey(Phaser.Keyboard.UP);
        this.keyDown = game.input.keyboard.addKey(Phaser.Keyboard.DOWN);
        this.keyLeft = game.input.keyboard.addKey(Phaser.Keyboard.LEFT);
        this.keyRight = game.input.keyboard.addKey(Phaser.Keyboard.RIGHT);
        this.spaceKey = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);

        

        this.keyQ = game.input.keyboard.addKey(Phaser.Keyboard.Q);
        this.keyW = game.input.keyboard.addKey(Phaser.Keyboard.W);
        this.keyE = game.input.keyboard.addKey(Phaser.Keyboard.E);
        this.keyR = game.input.keyboard.addKey(Phaser.Keyboard.R);

        
        this.keyLeft.onDown.add(function() {
            var myTween = game.add.tween(this.foodKingSprite);
            myTween.to({centerX: 360},200,Phaser.Easing.Linear.None);
            myTween.onComplete.add(function() {
                gameState.addFoodStock(foodTypes.CARBS);
            });
            myTween.start();
            this.foodKingSprite.isLeft = true;
        },this);
        this.keyRight.onDown.add(function() {
            var myTween = game.add.tween(this.foodKingSprite);
            myTween.to({centerX: 610},200,Phaser.Easing.Linear.None);
            myTween.onComplete.add(function() {
                gameState.addFoodStock(foodTypes.PROTEIN);
            });
            myTween.start();
            this.foodKingSprite.isLeft = false;
        },this);
        this.keyUp.onDown.add(function() {
            var myTween = game.add.tween(this.foodKingSprite);
            myTween.to({centerY: 32},200,Phaser.Easing.Linear.None);
            myTween.onComplete.add(function() {
                gameState.addFoodStock(foodTypes.FATS);
            });
            myTween.start();
            this.foodKingSprite.isUp = true;
        },this);
        this.keyDown.onDown.add(function() {
            var myTween = game.add.tween(this.foodKingSprite);
            myTween.to({centerY: 332},200,Phaser.Easing.Linear.None);
            myTween.onComplete.add(function() {
                gameState.addFoodStock(foodTypes.ALCOHOL);
            });
            myTween.start();
            this.foodKingSprite.isUp = false;
        },this);
        this.keyLeft.onUp.add(function() {
            var myTween = game.add.tween(this.foodKingSprite);
            myTween.to({centerX: foodKingStartX, centerY: foodKingStartY},200,Phaser.Easing.Linear.None);
            myTween.onComplete.add(function() {
                //gameState.addFoodStock(foodTypes.CARBS);
            });
            myTween.start();
        },this);
        this.keyUp.onUp.add(function() {
            var myTween = game.add.tween(this.foodKingSprite);
            myTween.to({centerX: foodKingStartX, centerY: foodKingStartY},200,Phaser.Easing.Linear.None);
            myTween.onComplete.add(function() {
                //gameState.addFoodStock(foodTypes.CARBS);
            });
            myTween.start();
        },this);
        this.keyDown.onUp.add(function() {
            var myTween = game.add.tween(this.foodKingSprite);
            myTween.to({centerX: foodKingStartX, centerY: foodKingStartY},200,Phaser.Easing.Linear.None);
            myTween.onComplete.add(function() {
                //gameState.addFoodStock(foodTypes.CARBS);
            });
            myTween.start();
        },this);
        this.keyRight.onUp.add(function() {
            var myTween = game.add.tween(this.foodKingSprite);
            myTween.to({centerX: foodKingStartX, centerY: foodKingStartY},200,Phaser.Easing.Linear.None);
            myTween.onComplete.add(function() {
                //gameState.addFoodStock(foodTypes.CARBS);
            });
            myTween.start();
        },this);

        this.leftKeyList = [this.keyQ, this.keyW, this.keyE, this.keyR];

        for (var key of this.leftKeyList) {
           key.onDown.add(function(key) {
                this.inputButtonSpriteMap[key.keyCode].alpha = 0.5;
                if (this.inputButtonStockMap[key.keyCode] == null) {
                    var stock = this.popStock();
                    if (stock != null) {
                        stock = stock[0];
                        this.inputButtonStockMap[key.keyCode] = stock;
                        stock.centerX = this.inputButtonSpriteMap[key.keyCode].centerX;
                        stock.centerY = this.inputButtonSpriteMap[key.keyCode].centerY;
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
        this.cannonSprites = [];
        for (var i = 0; i < 4; i++) {
            var temp = game.add.sprite(21+(i*72),348,"spr_cannon");
            temp.scale.setTo(2,2);
            this.cannonSprites.push(temp);
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

        timer = game.time.create(false);
        timer.loop(3500, ()=>{gameState.headPusher();}, this);
        timer.start();
    },
    headPusher: function() {
        gameState.pushNewRow(getRandomInt(1,4));
        if (this.heads.length > 4) {
            var killRow = this.heads.splice(0,1)[0];
            for (var i = 0; i < killRow.length;i++) {
                var killHead = killRow[i];
                if (killHead != null) killHead.destroy();
                killRow[i] = null;
            }
        }
        
    },
    update : function() {
        if (game.input.mousePointer.isDown) {
            console.log({x:game.input.mousePointer.x, y: game.input.mousePointer.y});
        }
        if (this.foodKingSprite.isUp) {
            if (this.foodKingSprite.isLeft) {
                this.foodKingSprite.frame = 2;
            }
            else this.foodKingSprite.frame = 1;
        }
        else {
            if (this.foodKingSprite.isLeft) {
                this.foodKingSprite.frame = 3;
            }
            else this.foodKingSprite.frame = 0;
        }
        /*if (this.foodCitizens.length < 5) {
            this.foodCitizens.push(createRandomFoodCitizen());
        }*/
        
    }
}