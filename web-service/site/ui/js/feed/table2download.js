(function ($) {

    $.fn.table_download = function (options) {
        var export_id = 0;
        var export_data_array = [];

        // define the default options
        var settings = $.extend({
            format: "csv",
            separator: ",",
            filename: "data",
            linkname: "Export",
            quotes: "\"",
            newline: "\r\n"
        }, options);

        // generate the CSV dowload link(s)
        if (settings.format == "csv") {
            return this.each(function () {
                export_id++;
                var csv = "";
                // loop each row of the table
                $(this).find("tr").each(function () {
                    // loop each td cell of the row
                    if ($(this).find("td").length > 0) {
                        var sep = "";
                        $(this).find("td").each(function (index) {
                            if (index === 0) {
                                //to remove checkbox leading comma
                            }
                            else if (index === 3) {
                                if ($(this).text() != "-") {
                                    csv += sep + settings.quotes + $(this).find('img').attr('src') + settings.quotes;
                                }
                                else {
                                    csv += sep + settings.quotes + $(this).text() + settings.quotes;//equal to "-"
                                }
                            }
                            else if (index === 5) {
                                switch ($(this).attr('data-order')) {
                                    case "GooglePlus":
                                        csv += sep + settings.quotes + "GooglePlus" + settings.quotes;
                                        break;
                                    case "Twitter":
                                        csv += sep + settings.quotes + "Twitter" + settings.quotes;
                                        break;
                                    case "Youtube":
                                        csv += sep + settings.quotes + "Youtube" + settings.quotes;
                                        break;
                                    case "Facebook":
                                        csv += sep + settings.quotes + "Facebook" + settings.quotes;
                                        break;
                                    case "Flickr":
                                        csv += sep + settings.quotes + "Flickr" + settings.quotes;
                                        break;
                                    case "RSS":
                                        csv += sep + settings.quotes + "RSS" + settings.quotes;
                                        break;
                                    default:
                                        csv += sep + settings.quotes + "-" + settings.quotes;
                                }
                            }
                            else if (index === 7) {
                                csv += sep + settings.quotes + $(this).attr('data-order') + settings.quotes;
                            }
                            else {
                                csv += sep + settings.quotes + $(this).text().replace(/(\r\n|\n|\r)/gm,"") + settings.quotes;
                                sep = settings.separator;
                            }
                        });
                        csv += settings.newline;
                    }
                    // loop each th cell of the row
                    else if ($(this).find("th").length > 0) {
                        var sep = "";
                        $(this).find("th").each(function (index) {
                            if (index === 0) {
                                //to remove checkbox leading comma
                            }
                            else {
                                csv += sep + settings.quotes + $(this).text() + settings.quotes;
                                sep = settings.separator;
                            }
                        });
                        csv += settings.newline;
                    }
                });


                window.URL = window.URL || window.webkiURL;
                // create the blob
                var blob = new Blob([csv]);
                // create the URL
                var blobURL = window.URL.createObjectURL(blob);

                fileName = settings.filename + '.csv';
                // add the download link
                $(this).append("<a class='table_download_csv_link' style='display:none' href='" + blobURL + "' download='" + fileName + "' export_id='" + export_id + "'>" + settings.linkname + "</a>");
                $('.table_download_csv_link')[0].click();
                $('.table_download_csv_link').remove();
                // add the event listener for IE blob download
                if (window.navigator.msSaveOrOpenBlob) {
                    var fileData = [csv];
                    blobObject = new Blob(fileData);
                    export_data_array.push({export_id: export_id, file_name: fileName, blob_object: blobObject});
                    $(this).find('.table_download_csv_link').click(function () {
                        console.log(export_data_array);
                        var export_id = $(this).attr("export_id");
                        for (var i = 0; i < export_data_array.length; i++) {
                            if (export_data_array[i].export_id == export_id) {
                                window.navigator.msSaveOrOpenBlob(export_data_array[i].blob_object, export_data_array[i].file_name);
                            }
                        }
                    });
                }
            });
        }

        // generate the XLS dowload link(s)
        if (settings.format == "xls") {
            return this.each(function () {
                export_id++;
                var csv = "";
                // standard XML header
                csv += '<?xml version="1.0"?>' + settings.newline;
                csv += '<?mso-application progid="Excel.Sheet"?>' + settings.newline;
                csv += '<Workbook' + settings.newline;
                csv += 'xmlns="urn:schemas-microsoft-com:office:spreadsheet"' + settings.newline;
                csv += 'xmlns:o="urn:schemas-microsoft-com:office:office"' + settings.newline;
                csv += 'xmlns:x="urn:schemas-microsoft-com:office:excel"' + settings.newline;
                csv += 'xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet"' + settings.newline;
                csv += 'xmlns:html="http://www.w3.org/TR/REC-html40">' + settings.newline;
                csv += '<Worksheet ss:Name="Sheet1">' + settings.newline;
                csv += '<Table>' + settings.newline;
                // loop each row of the table
                $(this).find("tr").each(function () {
                    csv += '<Row>' + settings.newline;
                    // loop each td cell of the row
                    var counter = 0;
                    if ($(this).find("td").length > 0) {
                        $(this).find("td").each(function () {
                            counter++;
                            csv += '<Cell ss:Index="' + counter + '">' + settings.newline;
                            csv += '<Data ss:Type="String">' + $(this).text() + '</Data>' + settings.newline;
                            csv += '</Cell>' + settings.newline;
                        });
                    }
                    // loop each th cell of the row
                    else if ($(this).find("th").length > 0) {
                        $(this).find("th").each(function () {
                            counter++;
                            csv += '<Cell ss:Index="' + counter + '">' + settings.newline;
                            csv += '<Data ss:Type="String">' + $(this).text() + '</Data>' + settings.newline;
                            csv += '</Cell>' + settings.newline;
                        });
                    }
                    csv += '</Row>' + settings.newline;
                });
                csv += '</Table>' + settings.newline;
                csv += '</Worksheet>' + settings.newline;
                csv += '</Workbook>' + settings.newline;

                window.URL = window.URL || window.webkiURL;
                // create the blob
                var blob = new Blob([csv]);
                // create the URL
                var blobURL = window.URL.createObjectURL(blob);

                fileName = settings.filename + '.xls';
                // add the download link
                $(this).append("<a class='table_download_xls_link' href='" + blobURL + "' download='" + fileName + "' export_id='" + export_id + "'>" + settings.linkname + "</a>");

                // add the event listener for IE blob download
                if (window.navigator.msSaveOrOpenBlob) {
                    var fileData = [csv];
                    blobObject = new Blob(fileData);
                    export_data_array.push({export_id: export_id, file_name: fileName, blob_object: blobObject});
                    $(this).find('.table_download_xls_link').click(function () {
                        console.log(export_data_array);
                        var export_id = $(this).attr("export_id");
                        for (var i = 0; i < export_data_array.length; i++) {
                            if (export_data_array[i].export_id == export_id) {
                                window.navigator.msSaveOrOpenBlob(export_data_array[i].blob_object, export_data_array[i].file_name);
                            }
                        }
                    });
                }
            });
        }
    };

}(jQuery));
