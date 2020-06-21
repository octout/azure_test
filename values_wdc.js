(function () {
    var myConnector = tableau.makeConnector();
    myConnector.getSchema = function (schemaCallback) {
        var cols = [{
            id: "Obs_id",
            alias: "Obsid",
            dataType: tableau.dataTypeEnum.string
        }, {
            id: "Obs_name",
            dataType: tableau.dataTypeEnum.string
        }, {
            id: "date",
            dataType: tableau.dataTypeEnum.string
        }, {
            id: "weather",
            alias: "weather",
            dataType: tableau.dataTypeEnum.string
        }, {
            id: "temp",
            alias: "temp",
            dataType: tableau.dataTypeEnum.float
        }, {
            id: "humidity",
            dataType: tableau.dataTypeEnum.int
        }, {
            id: "rainProbability",
            dataType: tableau.dataTypeEnum.int
        }, {
            id: "rainvalue",
            dataType: tableau.dataTypeEnum.float
        }, {
            id: "snowProbability",
            dataType: tableau.dataTypeEnum.int
        }, {
            id: "snowvalue",
            dataType: tableau.dataTypeEnum.float
        }, {
            id: "cloudCover",
            dataType: tableau.dataTypeEnum.float
        }, {
            id: "winddirection",
            dataType: tableau.dataTypeEnum.string
        }, {
            id: "windspeed",
            dataType: tableau.dataTypeEnum.float
        }, {
            id: "windgustspeed",
            dataType: tableau.dataTypeEnum.float
        }];

        var tableSchema = {
            id: "azuremapsAPI",
            alias: "dailyweaterhforercasts",
            columns: cols
        };
    
        schemaCallback([tableSchema]);
    };

    myConnector.getData = function(table, doneCallback) {
        var args = JSON.parse(tableau.connectionData),
            str_apikey = args.apikey,
            tableData = [];
        var count = forecast.length * json.length;
        $.getJSON("Obs.json", function(json) { //ローカルのjsonへアクセス
            for (var i = 0, len = json.length; i < len; i++) {
                console.log("SuccessRead-json"+ " count:" + count);
                //var count = json.length;
                var dateString = "query=" + json[i].lat + "," + json[i].lon,
                    apiCall = "https://atlas.microsoft.com/weather/forecast/hourly/json?subscription-key=" + str_apikey +"&api-version=1.0&" + dateString + "&duration=72&language=ja";
                (function(t){
                    $.getJSON(apiCall, function(resp) {                  
                        var forecast = resp.forecasts;
                        console.log("AcceptAPI"+ " count:" + count);
                        // Iterate over the JSON object
                        for(var j = 0, len = forecast.length; j < len; j++) {
                            tableData.push({
                                "Obs_id":json[t].Obs_id,
                                "Obs_name":json[t].Obs_name,
                                "date":forecast[j].date,
                                "weather":forecast[j].iconPhrase,
                                "temp":forecast[j].temperature.value,
                                "humidity": forecast[j].relativeHumidity,
                                "rainProbability":forecast[j].precipitationProbability,
                                "rainvalue":forecast[j].rain.value,
                                "snowProbability":forecast[j].snowProbability,
                                "snowvalue":forecast[j].snow.value,
                                "cloudCover":forecast[j].cloudCover,
                                "winddirection":forecast[j].wind.direction.localizedDescription,
                                "windspeed":forecast[j].wind.speed.value,
                                "windgustspeed":forecast[j].windGust.speed.value
                            });
                            next();
                        }
                    });
                })(i);
            }
        });
        function next(){
            console.log(count);
            count--
            if(count < 1){
                table.appendRows(tableData);
                doneCallback();
            };
        };
    };
    tableau.registerConnector(myConnector);
})();


$(document).ready(function () {
    $("#submitButton").click(function () {
        var apikey = document.getElementById('apikey').value;
        tableau.connectionData = JSON.stringify({apikey: apikey });
        tableau.connectionName = "AzureMapsWeatherService";
        tableau.submit();
    });
});
