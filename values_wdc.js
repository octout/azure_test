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
        var args = JSON.parse(tableau.connectionData);
        str_apikey = args.apikey;
        $.getJSON("Obs.json", function(json) { //ローカルのjsonへアクセス
            for (var i = 0, len = json.length; i < len; i++) {
                dateString = "query=" + json[i].lat + "," + json[i].lon,
                apiCall = "https://atlas.microsoft.com/weather/forecast/hourly/json?subscription-key=" + str_apikey +"&api-version=1.0&" + dateString + "&duration=72&language=ja";
                (function(t){
                    $.getJSON(apiCall, function(resp) {                  
                        var forecast = resp.forecasts,
                            tableData = [];
                        // Iterate over the JSON object
                        for(var j = 0, len = forecast.length; j < len; j++) {
                            tableData.push({
                                "Obs_id":json[t].Obs_id,
                                "Obs_name":json[t].Obs_name,
                                "date":forecast[j].date,
                                "weather":forecast[j].iconPhrase,
                                "temp":forecast[j].temperature.value,
                                "humidity": forecast[j].relativeHumidity,
                                "rainProbability":forecast[i].precipitationProbability,
                                "rainvalue":forecast[i].rain.value,
                                "snowProbability":forecast[i].snowProbability,
                                "snowvalue":forecast[i].snow.value,
                                "cloudCover":forecast[i].cloudCover,
                                "winddirection":forecast[i].wind.direction.localizedDescription,
                                "windspeed":forecast[i].wind.speed.value,
                                "windgustspeed":forecast[i].windGust.speed.value
                            });
                        }
                    table.appendRows(tableData);
                    doneCallback();
                    });
                })(i);

            }
     
        });
    };

    tableau.registerConnector(myConnector);

    $(document).ready(function () {
        $("#submitButton").click(function () {
            var apikey = document.getElementById('apikey').value;
            tableau.connectionData = JSON.stringify({apikey: apikey });
            tableau.connectionName = "AzureMapsWeatherService";
            tableau.submit();
        });
    });

})();