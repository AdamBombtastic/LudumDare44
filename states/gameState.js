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
        if (spriteKey.indexOf("spr_people") != -1) {
            var isFemale = getRandomInt(1,10) % 2 == 0;
            mySprite.animations.add("idle",isFemale ? [28,29] : [24,25]);
            mySprite.animations.add("die",isFemale ? [28,29,30,31] : [24,25,26,27]);
            mySprite.animations.play("idle",4,true);
        }
        else mySprite.frame = 0;
        break;
        case foodTypes.PROTEIN:
        mySprite = (spriteKey != null) ? game.add.sprite(x,y,spriteKey) : createRectangle(x,y,size,size,0xFFEE22);
        mySprite.width = size;
        mySprite.height = size;
        if (spriteKey.indexOf("spr_people") != -1) {
            var isFemale = getRandomInt(1,10) % 2 == 0;
            mySprite.animations.add("idle",isFemale ? [12,13] :[8,9]);
            mySprite.animations.add("die",isFemale ? [12,13,14,15] : [8,9,10,11]);
            mySprite.animations.play("idle",4,true);
        }
        else mySprite.frame = 2;
        break;
        case foodTypes.FATS:
        mySprite = (spriteKey != null) ? game.add.sprite(x,y,spriteKey) : createRectangle(x,y,size,size,0xFF6666);
        if (spriteKey.indexOf("spr_people") != -1) {
            var isFemale = getRandomInt(1,10) % 2 == 0;
            mySprite.animations.add("idle",isFemale ? [20,21] : [16,17]);
            mySprite.animations.add("die",isFemale ? [20,21,22,23]:[16,17,18,19]);
            mySprite.animations.play("idle",4,true);
        }
        else mySprite.frame = 3;
        mySprite.width = size;
        mySprite.height = size;
        
        break;
        case foodTypes.ALCOHOL:
        mySprite = (spriteKey != null) ? game.add.sprite(x,y,spriteKey) : createRectangle(x,y,size,size,0xFFFFFF);
        mySprite.width = size;
        mySprite.height = size;
        if (spriteKey.indexOf("spr_people") != -1) {
            var isFemale = getRandomInt(1,10) % 2 == 0;
            mySprite.animations.add("idle",[0,1]);
            mySprite.animations.add("die",[0,1,2,3]);
            mySprite.animations.play("idle",4,true);
        }
        else mySprite.frame = 1;
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
    var peopleType = getRandomInt(1,3);
    if (size == 4) {
        for (var i = 0; i < size; i++) {
            row.push(createFoodCitizen(getRandomInt(0,3),8+(80*i),0,64,"spr_people"+peopleType));
        }
    }
    else {
        for (var i = 0; i < 4; i++) {
            if (i < size) row.push(createFoodCitizen(getRandomInt(0,3),8+(80*i),0,64,"spr_people"+peopleType));
            else {
               row.push(null);
            }
        }
       shuffle(row);
       for (var i = 0; i < 4; i++) {
           var temp = row[i];
           if (temp != null) {
               temp.x = 8+(80*i);
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
    
    createExplosionAtPosition : function(x,y,center=true) {
        var anim = game.add.sprite(x,y,"fx_explosion");
        anim.scale.setTo(1.2,1.2);
        if (center) {
            anim.centerX = x;
            anim.centerY = y;
        }
        anim.animations.add("go");
        anim.animations.play("go",12,false,true);
        return anim;
    },
    animateCitizensOfType : function(type,anim) {
        var list = this.citizens[type];
        if (list != null) {
            for (var i = 0; i < list.length; i++) {
                var sprite = list[i];
                sprite.animations.play(anim,6,true);
            }
        }
    },
    getMaxInArray : function(arr) {
        var max = arr[0];
        for (var i = 0; i < arr.length; i++) {
            if (arr[i] > max) max = arr[i];
        }
        return max;
    },
    getFirstHeadForColumn : function(column) {
        for (var i  = 0; i < this.heads.length;i++) {
            row = this.heads[i];
            if (row[column] != null && row[column].alive){
                var temp = row[column];
                temp.rowIndex = i;
                return temp;
            } 
        }
        console.log("Returning null");
        return null;
    },
    checkSpecialDamage : function() {
        var fireMap = this.inputButtonStockMap;
        var success = true;
        var delRows = [];
        for (var key in fireMap) {
            if (key != null && fireMap[key] != null) {
                var type = fireMap[key].foodType;
                var returnVal = this.checkHeadDamage(key,type,false);
                success = success && returnVal != -1;
                if (success) delRows.push(returnVal);
            }
            else if (key == "SPACE") continue;
            else success = false;
        }
        if (success) {
            //clear rows;
            var max = this.getMaxInArray(delRows);
            delRows.push(max+1);
            var delSet = new Set(delRows);
            for (var k of delSet) {
                var row = this.heads[k];
                if (row == null) continue;
                for (var j = 0; j < row.length; j++) {
                    var head = row[j];
                    if (head != null) this.createExplosionAtPosition(head.centerX,head.centerY);
                    if (head != null && head.alive) {
                        gameState.score += 10 * this.multiplier
                        head.animations.play("die",8,false,true);
                    }
                }
            }
            console.log("Got em all");
            this.calories +=25; 
            this.calories = (this.calories > 100) ? 100 : this.calories;
        }
    },
    checkHeadDamage : function(myKey,type,isSpecial=false) {
        var columnIndex = this.inputButtonColumnMap[myKey];
        if (columnIndex != null && this.heads.length > 0) {
            var head = this.getFirstHeadForColumn(columnIndex);
            if (head != null && head.foodType == type) {
                var rowIndex = head.rowIndex;
                if (isSpecial) this.createExplosionAtPosition(head.x,head.y);
                head.animations.play("die",8,false,true);
                //head.destroy();
                //this.heads[0][columnIndex] = null;
                this.score += 10 * gameState.multiplier;
                return rowIndex;
            }
            else {
                
            }
        }
        return -1;
    },
    fireStock : function() {
        for (var key in gameState.inputButtonStockMap) {
            const stock = this.inputButtonStockMap[key];
            const myKey = key;
            var cannon = gameState.inputCannonMap[key];
            var addedCheck = false;
            
            if (stock != null) {
                cannon.animations.play("fire",8,false);
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
                stock.alpha = 1;
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
            topStock.x = 333;
            topStock.y = 395;
            topStock.width = 32;
            topStock.height = 32;

        }
        for (var i = 1; i < this.stockedFood.length; i++) {
            var myStock = this.stockedFood[i];
            this.stockedFood[i].x = 379 + ((i-1)*20) + 16;
            this.stockedFood[i].y = 394; 
            this.stockedFood[i].alpha = (i > 5) ? 0 : 1;
            this.stockedFood[i].width = 20;
            this.stockedFood[i].height = 20;
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
        var item = (createFoodCitizen(type,332+(stock*20),426,16,"spr_macros_lg"));
        this.stockedFood.unshift(item);
        if (stock > 5) item.alpha = 0;
        if (this.stockedFood.length >= 1) {
            var topStock = this.stockedFood[0];
            topStock.x = 333;
            topStock.y = 395;
            topStock.width = 32;
            topStock.height = 32;

        }
        for (var i = 1; i < this.stockedFood.length; i++) {
            var myStock = this.stockedFood[i];
            this.stockedFood[i].x = 379 + ((i-1)*20) + 16;
            this.stockedFood[i].y = 394; 
            this.stockedFood[i].alpha = (i > 5) ? 0 : 1;
            this.stockedFood[i].width = 20;
            this.stockedFood[i].height = 20;
        }
    },
    create : function() {
        game.stage.backgroundColor = "#4488AA";
        this.stage.disableVisibilityChange = true;

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

        var sections = game.add.sprite(0,0,"ui_bg");
        var frame = game.add.sprite(0,0,"ui_frame");

        function createFoodSprite(x,y,key) {
            var tempSprite = game.add.sprite(x,y,key);
            tempSprite.animations.add("dance",[0,1,2,3]);
            tempSprite.animations.add("scared",[4,5,6,7]);
            tempSprite.animations.play("dance",6,true);
            return tempSprite;
        }
        this.citizens = {
            0 : [createFoodSprite(352,140,"spr_citizenBagel"),createFoodSprite(382,140,"spr_citizenBagel"),createFoodSprite(352,200,"spr_citizenBread"),createFoodSprite(382,200,"spr_citizenBread")],
            1 : [createFoodSprite(515,140,"spr_citizenBean"),createFoodSprite(550,140,"spr_citizenBean"),createFoodSprite(515,200,"spr_citizenSausage"),createFoodSprite(550,220,"spr_citizenSausage")],
            2 :  [createFoodSprite(352,38,"spr_citizenButter"),createFoodSprite(382,38,"spr_citizenButter"),createFoodSprite(515,38,"spr_citizenAvocado"),createFoodSprite(550,38,"spr_citizenAvocado")],
            3 : [createFoodSprite(352,312,"spr_citizenJuice"),createFoodSprite(382,312,"spr_citizenJuice"),createFoodSprite(515,312,"spr_citizenWater"),createFoodSprite(550,312,"spr_citizenWater")],
        }
        
        this.foodKingSprite = game.add.sprite(240,240,"spr_foodKing");

        this.foodKingSprite.centerX = (320 + (320/2));
        this.foodKingSprite.centerY = 200;
        this.foodKingSprite.isLeft = false;
        this.foodKingSprite.isUp = false;

        const foodKingStartX = (320 + (320/2));
        const foodKingStartY = 200;
        
        this.calorieLifeBarBack = game.add.sprite(330,448,"ui_healthBar");
        this.calorieLifeBarBack.frame = 1;

        this.calorieLifeBar = game.add.sprite(330,448,"ui_healthBar");
        this.calorieLifeBar.frame = 0;

        this.calorieCropBar = new Phaser.Rectangle(0, 0, this.calorieLifeBar.width, this.calorieLifeBar.height);

        this.calorieLifeBar.crop(this.calorieCropBar);
        
        var textStyle = { font: "20px Arial", fill: "#ffEEFF"};

        this.scoreText = game.add.text(520, 402, "Score: " + this.score, textStyle);


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
            gameState.animateCitizensOfType(foodTypes.CARBS,"scared");
            var myTween = game.add.tween(this.foodKingSprite);
            myTween.to({centerX: 360},200,Phaser.Easing.Linear.None);
            myTween.onComplete.add(function() {
                gameState.addFoodStock(foodTypes.CARBS);
            });
            myTween.start();
            this.foodKingSprite.isLeft = true;
        },this);
        this.keyRight.onDown.add(function() {
            gameState.animateCitizensOfType(foodTypes.PROTEIN,"scared");
            var myTween = game.add.tween(this.foodKingSprite);
            myTween.to({centerX: 610},200,Phaser.Easing.Linear.None);
            myTween.onComplete.add(function() {
                gameState.addFoodStock(foodTypes.PROTEIN);
            });
            myTween.start();
            this.foodKingSprite.isLeft = false;
        },this);
        this.keyUp.onDown.add(function() {
            gameState.animateCitizensOfType(foodTypes.FATS,"scared");
            var myTween = game.add.tween(this.foodKingSprite);
            myTween.to({centerY: 32},200,Phaser.Easing.Linear.None);
            myTween.onComplete.add(function() {
                gameState.addFoodStock(foodTypes.FATS);
            });
            myTween.start();
            this.foodKingSprite.isUp = true;
        },this);
        this.keyDown.onDown.add(function() {
            gameState.animateCitizensOfType(foodTypes.ALCOHOL,"scared");
            var myTween = game.add.tween(this.foodKingSprite);
            myTween.to({centerY: 332},200,Phaser.Easing.Linear.None);
            myTween.onComplete.add(function() {
                gameState.addFoodStock(foodTypes.ALCOHOL);
            });
            myTween.start();
            this.foodKingSprite.isUp = false;
        },this);
        this.keyLeft.onUp.add(function() {
            gameState.animateCitizensOfType(foodTypes.CARBS,"dance");
            var myTween = game.add.tween(this.foodKingSprite);
            myTween.to({centerX: foodKingStartX, centerY: foodKingStartY},200,Phaser.Easing.Linear.None);
            myTween.onComplete.add(function() {
                //gameState.addFoodStock(foodTypes.CARBS);
            });
            myTween.start();
        },this);
        this.keyUp.onUp.add(function() {
            gameState.animateCitizensOfType(foodTypes.FATS,"dance");
            var myTween = game.add.tween(this.foodKingSprite);
            myTween.to({centerX: foodKingStartX, centerY: foodKingStartY},200,Phaser.Easing.Linear.None);
            myTween.onComplete.add(function() {
                //gameState.addFoodStock(foodTypes.CARBS);
            });
            myTween.start();
        },this);
        this.keyDown.onUp.add(function() {
            gameState.animateCitizensOfType(foodTypes.ALCOHOL,"dance");
            var myTween = game.add.tween(this.foodKingSprite);
            myTween.to({centerX: foodKingStartX, centerY: foodKingStartY},200,Phaser.Easing.Linear.None);
            myTween.onComplete.add(function() {
                //gameState.addFoodStock(foodTypes.CARBS);
            });
            myTween.start();
        },this);
        this.keyRight.onUp.add(function() {
            gameState.animateCitizensOfType(foodTypes.PROTEIN,"dance");
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
                this.inputButtonSpriteMap[key.keyCode].alpha = 0;
                if (this.inputButtonStockMap[key.keyCode] == null) {
                    var stock = this.popStock();
                    
                    if (stock != null) {
                        stock = stock[0];
                        var cannon = gameState.inputCannonMap[key.keyCode];
                        if (cannon != null) {
                            cannon.animations.play("item_"+stock.foodType,1,true);
                        }
                        var foodType = stock.foodType;
                        stock.destroy();
                        stock = game.add.sprite(0,0,"spr_bullets");
                        switch (foodType) {
                            case foodTypes.CARBS:
                            stock.frame = 0;
                            break;
                            case foodTypes.PROTEIN:
                            stock.frame = 2;
                            break;
                            case foodTypes.ALCOHOL:
                            stock.frame = 1;
                            break;
                            case foodTypes.FATS:
                            stock.frame = 3;
                            break;

                        }
                        this.inputButtonStockMap[key.keyCode] = stock;
                        stock.centerX = this.inputButtonSpriteMap[key.keyCode].centerX;
                        stock.centerY = this.inputButtonSpriteMap[key.keyCode].centerY-48;
                        stock.alpha = 0;
                        stock.foodType = foodType;
                    }
                    
                }
           },this);
           key.onUp.add(function(key) {
            this.inputButtonSpriteMap[key.keyCode].alpha = 1;
       },this);
        }

        this.spaceKey.onDown.add(function(key) {
            this.inputButtonSpriteMap["SPACE"].alpha = 0.5;
            this.inputButtonSpriteMap["SPACE"].frame = 1;
            gameState.fireStock();
            gameState.calories -= 2;
        },this);
        this.spaceKey.onUp.add(function(key) {
            this.inputButtonSpriteMap["SPACE"].alpha = 1;
            this.inputButtonSpriteMap["SPACE"].frame = 0;
        },this);

        this.inputButtonSpriteMap = {
            "81" : createRectangle(16,388,64,64,0x7722FF,0),
            "87" : createRectangle(88,388,64,64,0x7722FF,0),
            "69" : createRectangle(160,388,64,64,0x7722FF,0),
            "82" : createRectangle(232,388,64,64,0x7722FF,0),
            "SPACE" : game.add.sprite(8,446,"ui_space"),
        }
        this.inputButtonSpriteMap["SPACE"].frame = 0;
        this.cannonSprites = [];
        for (var i = 0; i < 4; i++) {
            var temp = game.add.sprite(16+(i*72),338,"spr_cannon");
            var overlay = game.add.sprite(16+(i*72),338,"spr_qwer");

            overlay.frame = i;
            temp.animations.add("idle",[0]).play(100,false);
            temp.animations.add("fire",[0,1,2,0]),
            temp.animations.add("item_"+foodTypes.CARBS,[3]);
            temp.animations.add("item_"+foodTypes.ALCOHOL,[4]);
            temp.animations.add("item_"+foodTypes.PROTEIN,[5]);
            temp.animations.add("item_"+foodTypes.FATS,[6]);
            this.cannonSprites.push(temp);
        }

        this.inputCannonMap = {
            "81" : gameState.cannonSprites[0],
            "87" : gameState.cannonSprites[1],
            "69" : gameState.cannonSprites[2],
            "82" : gameState.cannonSprites[3],
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
        this.calorieCropBar.width= this.calorieLifeBarBack.width*(this.calories/100);
        this.calorieLifeBar.crop(this.calorieCropBar);
        if (this.calories <= 0) {
            finalScore = this.score;
            game.state.start("score",true,false,null);
        }
        this.scoreText.text = "Score: " + this.score;
        this.scoreText.x = (CANVAS_WIDTH-this.scoreText.width)-10;
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