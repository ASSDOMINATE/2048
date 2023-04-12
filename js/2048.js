$(function () {
    load();
    checkGameOver();
    $("#start-new-game,#restart-game").click(startNewGame);
    $("#backup-button").click(goBackGame);
})

var startX = 0;
var startY = 0;

$("body").on("touchstart", function (e) {
    startX = e.originalEvent.changedTouches[0].pageX;
    startY = e.originalEvent.changedTouches[0].pageY;
});

$("body").on("touchend", function (e) {
    var moveEndX = e.originalEvent.changedTouches[0].pageX;
    var moveEndY = e.originalEvent.changedTouches[0].pageY;
    var X = moveEndX - startX;
    var Y = moveEndY - startY;
    var compareX = X < 0 ? -X : X;
    var compareY = Y < 0 ? -Y : Y;
    if (compareX < 5 && compareY < 5) {
        console.log("just click");
        return;
    }
    saveForBack();
    if (compareX > compareY) {
        if (X > 0) {
            moveRight();
        } else {
            moveLeft();
        }
    } else {
        if (Y > 0) {
            moveDown();
        } else {
            moveUp();
        }
    }
    if (isMove) {
        addRandNum();
    }
    checkGameOver();
});

var isMove = false;

function getBlockNum(line, row) {
    return parseInt(getBlock(line, row).attr("num"));
}

function forMerge($block) {
    $block.animate({opacity: '1'}, 500);
    $block.animate({opacity: '0.8'}, 500);
}

function forMove($block, $next) {
    $next.attr("class", $block.attr("class"));
}

function getBlock(line, row) {
    return $("#game-area").find(".game-line").eq(line).find('.game-block').eq(row);
}

function checkGameOver() {
    var isGameOver = true;
    for (var i = 0; i <= 3; i++) {
        var latestLineNum = -1;
        var latestRowNum = -1;
        for (var j = 0; j <= 3; j++) {
            var lineNum = getBlockNum(i, j);
            var rowNum = getBlockNum(j, i);
            if (lineNum == 0 || rowNum == 0) {
                isGameOver = false;
                return;
            }
            if (lineNum == latestLineNum || rowNum == latestRowNum) {
                isGameOver = false;
                return;
            }
            latestLineNum = lineNum;
            latestRowNum = rowNum;
        }
    }
    if (isGameOver) {
        $("#game-over-message").show();
    } else {
        $("#game-over-message").hide();
    }
}

function addScore(thisNum) {
    score = parseInt(score) + parseInt(thisNum);
    $("#game-score").text(score);
    if (score > parseInt(best)) {
        best = score;
        $("#best-score").text(best);
    }
}

function checkEmptyBlock($block) {
    return $block.attr("num") == 0;
}

function emptyBlock($block) {
    $block.attr("num", 0).text("");
}

function moveLineEmpty(isLeft) {
    $("#game-area").find(".game-line").each(function () {
        for (var i = isLeft ? 0 : 3; (i < 4 && isLeft) || (i > -1 && !isLeft); i += (isLeft ? 1 : -1)) {
            var $thisBlock = $(this).find(".game-block").eq(i);
            var thisNum = $thisBlock.attr("num");
            if (thisNum == 0) {
                continue;
            }
            var index = i;
            while (true) {
                index += isLeft ? -1 : 1;
                if (!checkEmptyBlock($(this).find(".game-block").eq(index)) || index == (isLeft ? -1 : 4)) {
                    break;
                }
                emptyBlock($thisBlock);
                $(this).find(".game-block").eq(index).text(thisNum).attr("num", thisNum);
                forMove($thisBlock, $(this).find(".game-block").eq(index));
                $thisBlock = $(this).find(".game-block").eq(index);
                isMove = true;
            }
        }
    })
}

function moveLineMerge(isLeft) {
    $("#game-area").find(".game-line").each(function () {
        var latestNum = -1;
        for (var i = isLeft ? 0 : 3; (i < 4 && isLeft) || (i > -1 && !isLeft); i += (isLeft ? 1 : -1)) {
            var $thisBlock = $(this).find(".game-block").eq(i);
            var thisNum = $thisBlock.attr("num");
            if (latestNum == -1 || thisNum == 0 || latestNum == 0) {
                latestNum = thisNum;
                continue;
            }
            if (latestNum == thisNum) {
                emptyBlock($thisBlock);
                thisNum = thisNum * 2;
                addScore(thisNum);
                $(this).find(".game-block").eq(i + (isLeft ? -1 : 1)).text(thisNum).attr("num", thisNum);
                forMerge($(this).find(".game-block").eq(i + (isLeft ? -1 : 1)));
                latestNum = thisNum;
                isMove = true;
                continue;
            }
            latestNum = thisNum;
        }
    })
}


function moveLeft() {
    isMove = false;
    moveLineEmpty(true);
    moveLineMerge(true);
    moveLineEmpty(true);

}

function moveRight() {
    isMove = false;
    moveLineEmpty(false);
    moveLineMerge(false);
    moveLineEmpty(false);
}

function moveRowEmpty(isUp) {
    for (var i = 0; i <= 3; i++) {
        for (var j = isUp ? 0 : 3; (j < 4 && isUp) || (j > -1 && !isUp); j += (isUp ? 1 : -1)) {
            var $thisBlock = getBlock(j, i);
            var thisNum = $thisBlock.attr("num");
            if (thisNum == 0) {
                continue
            }
            var index = j;
            while (true) {
                index += (isUp ? -1 : 1);
                if (!checkEmptyBlock(getBlock(index, i)) || index == (isUp ? -1 : 4)) {
                    break;
                }
                emptyBlock($thisBlock);
                getBlock(index, i).text(thisNum).attr("num", thisNum);
                forMove($thisBlock, getBlock(index, i));
                $thisBlock = getBlock(index, i);
                isMove = true;
            }
        }
    }
}

function moveRowMerge(isUp) {
    for (var i = 0; i <= 3; i++) {
        var latestNum = -1;
        for (var j = isUp ? 0 : 3; (j < 4 && isUp) || (j > -1 && !isUp); j += (isUp ? 1 : -1)) {
            var $thisBlock = getBlock(j, i);
            var thisNum = $thisBlock.attr("num");
            if (latestNum == -1 || thisNum == 0 || latestNum == 0) {
                latestNum = thisNum;
                continue;
            }
            if (latestNum == thisNum) {
                emptyBlock($thisBlock);
                thisNum = thisNum * 2;
                getBlock(j + (isUp ? -1 : 1), i).text(thisNum).attr("num", thisNum);
                forMerge(getBlock(j + (isUp ? -1 : 1), i));
                addScore(thisNum);
                latestNum = thisNum;
                isMove = true;
                continue;
            }
            latestNum = thisNum;
        }
    }
}

function moveUp() {
    isMove = false;
    moveRowEmpty(true);
    moveRowMerge(true);
    moveRowEmpty(true);
}

function moveDown() {
    isMove = false;
    moveRowEmpty(false);
    moveRowMerge(false);
    moveRowEmpty(false);
}

function addRandNum() {
    save();
    var emptyBlocks = [];
    var line = 0;
    $("#game-area").find(".game-line").each(function () {
        $(this).find(".game-block").each(function (i) {
            if ($(this).attr("num") == 0) {
                emptyBlocks.push([line, i]);
            }
        })
        line++;
    })
    if (emptyBlocks.length == 0) {
        return;
    }
    steps++;
    $("#game-step").text(steps);
    var firstIndex = emptyBlocks[randomNum(0, emptyBlocks.length - 1)];
    setValues(firstIndex[0], firstIndex[1]);
    save();
    // if (Math.round(Math.random()) == 1) {
    //     return;
    // }
    // var secondIndex = emptyBlocks[randomNum(0, emptyBlocks.length - 1)];
    // if (firstIndex == secondIndex) {
    //     return;
    // }
    // setValues(secondIndex[0], secondIndex[1]);
    // save();
}

function setValues(line, index, num) {
    if (num == null) {
        num = Math.round(Math.random()) == 0 ? 2 : Math.round(Math.random()) ? 2 : 4;
    }
    var $thisBlock = getBlock(line, index);
    $thisBlock.text(num).attr("num", num);
    $thisBlock.animate({opacity: '0.5'}, 0);
    $thisBlock.animate({opacity: '1'}, 500);
    $thisBlock.animate({opacity: '0.8'}, 500);
}


function randomNum(minNum, maxNum) {
    if (maxNum <= minNum) {
        return minNum;
    }
    switch (arguments.length) {
        case 1:
            return parseInt(Math.random() * minNum + 1, 10);
            break;
        case 2:
            return parseInt(Math.random() * (maxNum - minNum + 1) + minNum, 10);
            break;
        default:
            return 0;
            break;
    }
}

var gameKey = "game-2048";

function load() {
    var record = localStorage.getItem(gameKey);
    if (record == null) {
        return;
    }
    record = JSON.parse(record);
    steps = record.steps;
    score = record.score;
    best = record.best;
    gameDates = record.gameDates;
    if (gameDates == null) {
        gameDates = [
            [0, 0, 0, 0],
            [0, 0, 0, 0],
            [0, 0, 0, 0],
            [0, 0, 0, 0],
        ]
    }
    initDates();
    checkNumStyle();
}

function initDates() {
    $("#game-step").text(steps);
    $("#game-score").text(score);
    $("#best-score").text(best);
    var line = 0;
    // gameDates = [
    //     [2, 256, 512, 0],
    //     [4, 128, 1024, 0],
    //     [8, 64, 2048, 16384],
    //     [16, 32, 4096, 8192],
    // ]
    $("#game-area").find(".game-line").each(function () {
        $(this).find(".game-block").each(function (i) {
            var thisNum = gameDates[line][i];
            $(this).attr("num", thisNum);
            $(this).text(thisNum == 0 ? "" : thisNum);
        })
        line++;
    })

}

var steps = 0;
var score = 0;
var best = 0;
var gameDates = [
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
]

function loadRecord() {
    steps = $("#game-step").text();
    score = $("#game-score").text();
    best = $("#best-score").text();
    var line = 0;
    $("#game-area").find(".game-line").each(function () {
        $(this).find(".game-block").each(function (i) {
            var thisNum = $(this).attr("num");
            gameDates[line][i] = thisNum;
        })
        line++;
    })
    var record = {
        "steps": steps,
        "score": score,
        "best": best,
        "gameDates": gameDates
    }
    return record;
}

function save() {
    var record = loadRecord();
    localStorage.setItem(gameKey, JSON.stringify(record));
    checkNumStyle();
}

function changeClass($ele, classStr) {
    setTimeout(function () {
        $ele.attr("class", classStr);
    }, 80);
}

function printNumStyle() {
    $("#game-area").find(".game-line").each(function () {
        $(this).find(".game-block").each(function () {
            var num = parseInt($(this).attr("num"));
            if (num == 0) {
                changeClass($(this), "game-block");
                return true;
            }
            changeClass($(this), "game-block game-2048-" + num);
        })
    })
}

function checkNumStyle() {
    printNumStyle();
}

var gameBackUpKey = gameKey + "_backup";

function saveForBack() {
    var backupRecord = localStorage.getItem(gameBackUpKey);
    var record = loadRecord();
    if(backupRecord != null){
        var backup = JSON.parse(backupRecord);
        console.log("b " + backup.steps + " l " + record.steps);
        if(backup.steps == record.steps) {
            return;
        }
    }
    localStorage.setItem(gameBackUpKey, JSON.stringify(record));
    $("#backup-button").removeClass("is-go-back");
}

function goBackGame(){
    if($("#backup-button").hasClass("is-go-back")){
        return;
    }
    var record = localStorage.getItem(gameBackUpKey);
    if (record == null) {
        return;
    }
    record = JSON.parse(record);
    steps = record.steps;
    score = record.score;
    best = record.best;
    gameDates = record.gameDates;
    if (gameDates == null) {
        return;
    }
    initDates();
    checkNumStyle();
    $("#backup-button").addClass("is-go-back");
    $("#game-over-message").hide();
}

function startNewGame() {
    console.log("new game !");
    $("#game-over-message").hide();
    $("#game-step").text(0);
    $("#game-score").text(0);
    $("#game-area").find(".game-line").find(".game-block").text("").attr("num", 0);
    save();
    initDates();
    addRandNum();
}