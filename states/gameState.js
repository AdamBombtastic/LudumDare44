var finalScore = 0;
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

function createFoodCitizen(type,x=getRandomInt(320,600),y=getRandomInt(0,360),size=16, spriteKey=null) {
    var mySprite = null;
    switch (type) {
        case foodTypes.CARBS:
        mySprite = (spriteKey != null) ? game.add.sprite(x,y,spriteKey) : createRectangle(x,y,size,size,0x55FF88);
        mySprite.width = size;
        mySprite.height = size;
        mySprite.frame = 0;
        break;
        case foodTypes.PROTEIN:
        mySprite = (spriteKey != null) ? game.add.sprite(x,y,spriteKey) : createRectangle(x,y,size,size,0xFFEE22);
        mySprite.width = size;
        mySprite.height = size;
        mySprite.frame = 2;
        break;
        case foodTypes.FATS:
        mySprite = (spriteKey != null) ? game.add.sprite(x,y,spriteKey) : createRectangle(x,y,size,size,0xFF6666);
        mySprite.width = size;
        mySprite.height = size;
        mySprite.frame = 3;
        break;
        case foodTypes.ALCOHOL:
        mySprite = (spriteKey != null) ? game.add.sprite(x,y,spriteKey) : createRectangle(x,y,size,size,0xFFFFFF);
        mySprite.width = size;
        mySprite.height = size;
        mySprite.frame = 1;
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
            row.push(createFoodCitizen(getRandomInt(0,3),16+(80*i),0,32,"spr_macros"));
        }
    }
    else {
        for (var i = 0; i < 4; i++) {
            if (i < size) row.push(createFoodCitizen(getRandomInt(0,3),16+(80*i),0,32,"spr_macros"));
            else {
               row.push(null);
            }
        }
       shuffle(row);
       for (var i = 0; i < 4; i++) {
           var temp = row[i];
           if (temp != null) {
               temp.x = 24+(80*i);
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
    rowTime : 3500,
    rowTimer: 0,
    pointTimer : 1000,
    calories: 100,
    score: 0,
    multiplier: 1,
    headSize: 1,
    rowCount : 0,
    lastRowCount: null,
    stage : 1,
    

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
                    gameState.score += 10 * this.multiplier
                    if (head != null) head.destroy();
                }
                this.checkUpgradeDifficulty();
            }
            this.heads = [];
            console.log("Got em all");
            this.calories +=25; 
            this.calories = (this.calories > 100) ? 100 : this.calories;
        }
    },
    checkHeadDamage : function(myKey,type) {
        var columnIndex = this.inputButtonColumnMap[myKey];
        if (columnIndex != null && this.heads.length > 0) {
            var head = this.getFirstHeadForColumn(columnIndex);
            if (head != null && head.foodType == type) {
                head.destroy();
                this.heads[0][columnIndex] = null;
                this.score += 10 * gameState.multiplier;
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
            stock[0].width = 16;
            stock[0].height = 16;
        }
        if (this.stockedFood.length >= 1) {
            var topStock = this.stockedFood[0];
            topStock.x = 326;
            topStock.y = 388;
            topStock.width = 32;
            topStock.height = 32;

        }
        for (var i = 1; i < this.stockedFood.length; i++) {
            var myStock = this.stockedFood[i];
            this.stockedFood[i].x = 326;
            this.stockedFood[i].y = 421 + ((i-1)*20);
            this.stockedFood[i].alpha = (i > 5) ? 0 : 1;
            this.stockedFood[i].width = 16;
            this.stockedFood[i].height = 16;
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
    moveHeads : function(amount) {
        for (var i = 0; i < this.heads.length; i++) {
            var row = this.heads[i];
            for (var head of row) {
                if (head != null) head.y += amount;
            }
        }
    },
    addFoodStock : function(type) {

        var stock = this.stockedFood.length;
        if (stock >= 5) return;
        var item = (createFoodCitizen(type,332+(stock*20),426,16,"spr_macros"));
        this.stockedFood.unshift(item);
        if (stock > 5) item.alpha = 0;
        if (this.stockedFood.length >= 1) {
            var topStock = this.stockedFood[0];
            topStock.x = 326;
            topStock.y = 388;
            topStock.width = 32;
            topStock.height = 32;

        }
        for (var i = 1; i < this.stockedFood.length; i++) {
            var myStock = this.stockedFood[i];
            this.stockedFood[i].x = 326;
            this.stockedFood[i].y = 421 + ((i-1)*16);
            this.stockedFood[i].alpha = (i > 5) ? 0 : 1;
            this.stockedFood[i].width = 16;
            this.stockedFood[i].height = 16;
        }
    },
    create : function() {
        game.stage.backgroundColor = "#4488AA";


        this.mySprite = null;
        this.lastPoint= {};
        this.keyQ = null;
        this.keyW = null;
        this.keyE = null;
        this.keyR = null;
        this.inputButtonSpriteMap = null;
        this.inputButtonStockMap = {};
        this.inputButtonColumnMap = null;
        this.leftKeyList = [];
        this.foodCitizens = [];
        this.stockedFood = [];
        this.heads=[];
        this.rowTime = 3500;
        this.rowTimer = 0;
        this.pointTimer = 1000;
        this.calories = 100;
        this.score = 0;
        this.multiplier = 1;
        this.headSize = 1;
        this.rowCount = 0;
        this.lastRowCount = null;
        this.stage = 1;

        var sidePanel = createRectangle(0,0,320,380,0x000000);
        var inputPanel = createRectangle(0,380,640,100,0x444444);

       
        var fatSection = createRectangle(340,0,280,80,0xFFFF11);
        var alcoholSection = createRectangle(340,300,280,80,0x8B4513);

        var proteinSection = createRectangle(560,20,80,280,0xFF2222);
        var carbSection = createRectangle(320,20,80,280,0xFFFFFF);  
        
        this.foodKingSprite = game.add.sprite(240,240,"spr_foodKing");//createRectangle(240,240,32,32,0xFFF5555);
        //this.foodKingSprite.scale.setTo(2,2);
        this.foodKingSprite.centerX = (320 + (320/2));
        this.foodKingSprite.centerY = 190 - 16;
        this.foodKingSprite.isLeft = false;
        this.foodKingSprite.isUp = false;

        const foodKingStartX = (320 + (320/2));
        const foodKingStartY = 190 - 16;
        
        this.calorieLifeBar = createRectangle(370,454,245*(this.calories/100),20,0x2266FF);

        var textStyle = { font: "24px Arial", fill: "#ffEEFF"};

        this.scoreText = game.add.text(368, 397, "Score: " + this.score, textStyle);


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
            gameState.calories -= 2;
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
            temp.frame = i;
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
        //timer.loop(3500, ()=>{gameState.headPusher();}, this);
        timer.start();
    },
    checkUpgradeDifficulty: function() {
        if (this.lastRowCount == this.rowCount) return;
        console.log("Good to upgrade:" + this.rowCount);
        if (this.rowCount % 4 == 0) {
            if (this.headSize < 4) this.headSize += 1;
            
        }
        if (this.rowCount % 10 == 0) {
            this.multiplier += 1;
            this.rowTime -= 250;
            if (this.rowTime < 2000) this.rowTime = 2000;
        }
        this.lastRowCount = this.rowCount;
    },
    headPusher: function() {
        gameState.pushNewRow(getRandomInt(1,this.headSize));
        this.rowCount +=1;
        if (this.heads.length > 4) {
            var killRow = this.heads.splice(0,1)[0];
            for (var i = 0; i < killRow.length;i++) {
                var killHead = killRow[i];
                if (killHead != null && killHead.alive) {
                    this.calories-=25;
                    this.calories = (this.calories < 0) ? 0 : this.calories;
                }
                if (killHead != null) killHead.destroy();
                killRow[i] = null;
            }
            this.checkUpgradeDifficulty();
        }
        
    },
    update : function() {
        this.calorieLifeBar.width= 245*(this.calories/100);
        if (this.calories <= 0) {
            finalScore = this.score;
            game.state.start("score",true,false,null);
        }
        this.scoreText.text = "Score: " + this.score;
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

        var deltaTime = game.time.elapsed;
        /*if (this.foodCitizens.length < 5) {
            this.foodCitizens.push(createRandomFoodCitizen());
        }*/
        this.rowTimer -= deltaTime;
        this.pointTimer -= deltaTime;
        if (this.rowTimer <= 0) {
            this.headPusher();
            this.rowTimer = this.rowTime;
        }
        else {
            var distance = (80/this.rowTime)*deltaTime;
            this.moveHeads(distance);
        }
        if (this.pointTimer <= 0) {
            this.score += 1*gameState.multiplier;
            this.pointTimer = 1000;
        }
    }
}