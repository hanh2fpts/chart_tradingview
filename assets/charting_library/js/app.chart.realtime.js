"use strict";

const arrListSolutionDay = ["D", "1D", "M", "W"];
const arrListSolutionIntraDay = ["1", "5", "15", "30"];
// do có thể dùng nhiều chart trên cùng 1 tab nên cần phải khai báo datafeed và widget riêng
var param = window.location.search;
if (param == "") throw "datafeed chưa được khởi tạo";
else {
    var datafeed = {};
    if (param.startsWith("?datafeed")) {
        var arr = param.split("&");
        var keyDataFeed = arr[0].replace("?datafeed=", "");
        //
        datafeed[keyDataFeed] = window.parent[keyDataFeed];

        var updateDataRealTime = function (key, value, interval) {
            var result = {};
            result[key] = proccessData(key, value, interval);
            datafeed[keyDataFeed]._dataPulseProvider.updateDataRealTime(key, result[key], interval);
        }

        var proccessData = function (key, data, interval) {
            var check = true;
            var objData = {
                "bars": [],
                "meta": { "noData": false }
            };
            if (key.split('_')[1] !== interval) return objData;
            for (var i = 0; i < data.length; i++) {
                var myItem = data[i];
                console.log("key :", key, "resolution :", interval, "H :", arrListSolutionDay.includes(interval), " I :", (arrListSolutionIntraDay.includes(interval)))
                if ((arrListSolutionDay.includes(interval) && myItem.t == "H") || (arrListSolutionIntraDay.includes(interval) && myItem.t == "I")) {
                    var item = data[i].d;
                    var now = new Date();
                    var x = item.t.split(':');
                    var time = x.length > 1 ? new Date(now.getFullYear(), now.getMonth(), now.getDate(), parseInt(x[0]), parseInt(x[1])) : item.t;
                    var objItem = {
                        "time": data[i].t == "H" ? new Date(item.t + " 07:00:00 +0700").getTime() : time.getTime(),
                        "close": item.c,
                        "open": item.o,
                        "high": item.h,
                        "low": item.l,
                        "volume": item.v
                    }
                    objData.bars.push(objItem);
                    check = false;
                }
            }
            if (objData.bars.length == 1) objData.bars.push(objData.bars[0]);
            objData.meta.noData = check;
            //console.log("proccessData", objData, test);
            return objData;
        }
        // kiểm tra widget đã sẵn sàng chưa nếu rồi kết nối đến server
        datafeed[keyDataFeed].onReady(function () {
            var subscribers = datafeed[keyDataFeed]._dataPulseProvider._subscribers;
            // key trong phần updateDataRealtime
            var keySub = Object.keys(subscribers)[0]; // FPT_D (FPT là mã chứng khoán , D là interval - 1 ngày , 1 = 1 phút) 
            // sau này dùng để phần biệt data realtime hist và realtime intraday
            var interval = keySub != void 0 ? keySub.split('_')[1] : "D";
            // mã chứng để tạo group
            var symbol = keySub != void 0 ? keySub.split('_')[0] : "FPT";

            // ép transport webscoket
            //.withUrl("TAChartHub", {
            //    skipNegotiation: true,
            //        transport: signalR.HttpTransportType.WebSockets
            //})

            var connection = new signalR.HubConnectionBuilder()
                .withUrl("https://chart.fpts.com.vn/chart3r/TAChartHub")
                .build();

            connection.on("ReceiveMessage", function (user, message) {
                subscribers = datafeed[keyDataFeed]._dataPulseProvider._subscribers;
                // key trong phần updateDataRealtime
                keySub = Object.keys(subscribers)[0]; // FPT_D (FPT là mã chứng khoán , D là interval - 1 ngày , 1 = 1 phút) 
                // sau này dùng để phần biệt data realtime hist và realtime intraday
                interval = keySub != void 0 ? keySub.split('_')[1] : "D";
                // mã chứng để tạo group
                symbol = keySub != void 0 ? keySub.split('_')[0] : "FPT";
                console.info({ user: user }, { message: message }); // 2019-08-07 16:07:16 ngocta2 ;  pub => sub => push
                if (message.startsWith("[")) {
                    message = JSON.parse(message);
                }
                if (typeof (message) == "object") {
                    /// nhận data và update
                    if (user == symbol) {
                        updateDataRealTime(keySub, message, interval);
                    }
                }
            });

            var startConnection = function () {
                connection.start().then(function () {
                    // kết nối sẽ add connection và group symbol cần (symbol là mã chứng khoán)
                    connection.invoke("AddToGroup", symbol).catch(function (err) {
                        return console.error(err.toString());
                    });
                }).catch(function (err) {
                    setTimeout(function () { startConnection(); }, 5000);
                    return console.error(err.toString());
                });
            };
            connection.onclose(function () {
                startConnection();
            });
            startConnection();
            //connection.onclose(startConnection());
            //connection.stop().then(function () {
            //    //console.log("stop ");
            //});
        })
    }
    else throw "widget và datafeed chưa được khởi tạo";
}
