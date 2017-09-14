var express = require('express');
var request = require('request');
var router = express.Router();

/* GET home page. */

// instructions:
// obtain the list of customers from the api and perform the validations
router.get('/', function(req, res, next) {
  var url = 'https://backend-challenge-winter-2017.herokuapp.com/customers.json';
  var currentPage = 1;
  var rc = {'invalid_customers' : []}; // variable to store the response

  // main function
  var fetchRemaining = function(url, currentPage) {
    request(url + (currentPage > 1 ? ('?page=' + currentPage) : ''), function(err, response, body) {
      if (!err) {
        var data = JSON.parse(body);

        for (var i = 0 ; i < data.customers.length ; i++) {
          var invalidFields = [];

          for (var n = 0 ; n < data.validations.length ; n++) {
            var attr = Object.keys(data.validations[n])[0];

            // flags
            var required = data.validations[n][attr].required;
            var type = data.validations[n][attr].type;
            var min, max;
            if (data.validations[n][attr].length) {
              min = data.validations[n][attr].length.min;
              max = data.validations[n][attr].length.max;
            }

            // validations
            if (required && data.customers[i][attr] == undefined) {
              invalidFields.push(attr);
              continue;
            }
            // only need to verify type and length if not null
            if (data.customers[i][attr] != undefined) {
              if (type != undefined && typeof data.customers[i][attr] != type) {
                console.log(typeof data.customers[i][attr])
                invalidFields.push(attr);
                continue;
              }
              if ( (min != undefined && data.customers[i][attr].length < min) ||
              (max != undefined && data.customers[i][attr].length > max) ) {
                invalidFields.push(attr);
                continue;
              }
            }
          }

          // add the user if contains invalid fields
          if (invalidFields.length > 0) {
            rc.invalid_customers.push({'id': data.customers[i].id, 'invalid_fields': invalidFields});
          }
        }

        // stop when reached end of list
        if (data.pagination.current_page * data.pagination.per_page >= data.pagination.total) {
          res.json(rc);
        }
        else {
          fetchRemaining(url, currentPage + 1)
        }
      }
    });

  }

  // call function to retrieve invalid customers
  fetchRemaining(url, currentPage);
});


module.exports = router;
