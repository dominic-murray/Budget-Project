/////////////////////////////////////////////////
/////////// BUDGET CONTROLLER 

var budgetController = (function() {
     
    var Expense = function(id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
        this.percentage = -1;
    };
    
    Expense.prototype.calcPercentage = function(totalIncome) {
        if (totalIncome > 0) {
        this.percentage = Math.round((this.value / totalIncome) * 100); 
        } else {
            this.percentage = -1;
        }
    };
    
    Expense.prototype.getPercentage = function() {
        return this.percentage;
    };
    
     var Income = function(id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
     };
    
    var calculateTotel = function(type) {
        var sum = 0;
        data.allItems[type].forEach(function(cur) {
            sum += cur.value;
        });
        data.totals[type] = sum;
    };
    
    var data = {
        allItems: {
            exp: [],
            inc: []  
        },
        totals: {
            exp: 0,
            inc: 0
        },
        budget: 0,
        percentage: -1
        
    };
    
    
    return {
        addItem: function(type, des, val) {
            var newItem, ID;
            
            // Create new ID
            if(data.allItems[type].length > 0) {
           ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
            } else {
                ID = 0;
            }
            // Create a new item based on income or expense type
            if (type === 'exp') {
                newItem = new Expense(ID, des, val); 
            } else if (type === 'inc') {
                newItem = new Income(ID, des, val);
            }
            
            // push it to data structure
            data.allItems[type].push(newItem);
            
            // return the new element
            return newItem;
        },
        
        deleteItem: function(type, id) {
            var ids, index;
            
            ids = data.allItems[type].map(function(current) {
               return current.id; 
            });
            
            index = ids.indexOf(id);
            
            if (index !== -1) {
                data.allItems[type].splice(index, 1);
            }
        },
        
        calculateBudget: function() {
            
            // calculate total income and expenses
            calculateTotel('exp');
            calculateTotel('inc');
            
            // calculate the budget income - expenses
            data.budget = data.totals.inc - data.totals.exp;
            
            // calculate the precentage of income that has been spent
            if (data.totals.inc > 0) {
                data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
            } else {
                data.percentage = -1; 
            }

        },
        
        calculatePercentages: function() {
             data.allItems.exp.forEach(function(cur) {
                cur.calcPercentage(data.totals.inc); 
             });  
        },
        
        getPercentage: function() {
         var allPerc = data.allItems.exp.map(function(cur) {
             return cur.getPercentage();
         });  
            return allPerc;
        },
        
        getBudget: function() {
            return {
                budget: data.budget,
                totalInc: data.totals.inc,
                totalExp: data.totals.exp,
                percentage: data.percentage
            };
        },
        
        testing: function(){
            console.log(data);
        }
    };
    
 })();



/////////////////////////////////////////////////
/////////// UI CONTROLLER

var UIController = (function() {
    
    var DOMstrings = {
        inputType: '.add__type',
        inputDescription: '.add__description',
        inputValue: '.add__value',
        inputBtn: '.add__btn',
        incomeContainer: '.income__list',
        expensesContainer: '.expenses__list',
        budgetLabel: '.budget__value',
        incomeLabel: '.budget__income--value',
        expensesLabel: '.budget__expenses--value',
        percentageLabel: '.budget__expenses--percentage',
        container: '.container',
        expensesPercentageLabel: '.item__percentage',
        dateLabel: '.budget__title--month'
    };
    
    var formatNumber = function(num, type) {
            var numSplit, int, dec, type;
            num = Math.abs(num);
            num = num.toFixed(2);
            
            numSplit = num.split('.');
            int = numSplit[0];
            if (int.length > 3) {
                int = int.substr(0, int.length - 3) + ',' + int.substr(int.length - 3, 3);
            }
            
            dec = numSplit[1];
            
            type === 'exp' ? sign = '-' : sign = '+';
            
            return (type === 'exp' ? '-' : '+') + ' ' + int + '.' + dec;
            
            // + or - before the number and 2 decimal points comma seperating the thousands. 
        };  
    
    return {
      getInput: function() {
          return {
              type: document.querySelector(DOMstrings.inputType).value,
              description: document.querySelector(DOMstrings.inputDescription).value,
              value: parseFloat( document.querySelector(DOMstrings.inputValue).value)
              
          };  
      },
        
        addListItem: function(obj, type) {
            var html, newHtml, element;
            // create HTML string with placeholder test
            
            if(type === 'inc'){ 
                element = DOMstrings.incomeContainer;
                
                html = '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            } else if (type === 'exp') { 
                element = DOMstrings.expensesContainer;
                
                html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            }            
            // replace placeholder text
            newHtml = html.replace('%id%', obj.id);
            newHtml = newHtml.replace('%description%', obj.description);
            newHtml = newHtml.replace('%value%', formatNumber(obj.value, type));
            
            // insert HTML into the DOM
            document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);
        },
        
        deleteListItem: function(selectorID) {
            
                var el = document.getElementById(selectorID);
                el.parentNode.removeChild(el);
        },
        
        clearFields: function() {
            var fields, fieldsArr;
            
            fields = document.querySelectorAll(DOMstrings.inputDescription + ', ' + DOMstrings.inputValue);
            
            fieldsArr = Array.prototype.slice.call(fields);
            
            fieldsArr.forEach(function(current, index, array) {
                current.value = "";
            });
            
            fieldsArr[0].focus();
        },
        
        displayBudget: function(obj) {
            var type;
            obj.budget > 0 ? type = 'inc' : type = 'exp'
            
            document.querySelector(DOMstrings.budgetLabel).textContent = formatNumber(obj.budget, type);
            document.querySelector(DOMstrings.incomeLabel).textContent = formatNumber(obj.totalInc, 'inc');
            document.querySelector(DOMstrings.expensesLabel).textContent = formatNumber(obj.totalExp, 'exp');
            
            
            if (obj.percentage > 0) { document.querySelector(DOMstrings.percentageLabel).textContent = obj.percentage + '%';
          } else { document.querySelector(DOMstrings.percentageLabel).textContent = '---';
          }
        },
        
        displayPercentages: function(percentages) {
            
            var fields = document.querySelectorAll(DOMstrings.expensesPercentageLabel);
            
            var nodeListForEach = function(list, callback) {
                for (var i = 0; i < list.length; i++) {
                    callback(list[i], i);
                }
            };
            
            nodeListForEach(fields, function(current, index) {
                if (percentages[index] > 0) {
                    current.textContent = percentages[index] + '%';
            } else {
                current.textContent = '---';
            }  
         });
            
        },
        
        displayMonth: function() {
          var now, months, month, year;
            now = new Date();
            months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
            month = now.getMonth();
            year = now.getFullYear();
            document.querySelector(DOMstrings.dateLabel). textContent = months[month] + ' ' + year;
        },
        
        getDOMstrings: function() {
            return DOMstrings;
        }
    };
    
    
})();



/////////////////////////////////////////////////
/////////// GLOBAL APP CONTROLLER

var controller = (function(budgetCtrl, UICtrl) {
    
    var setupEventListeners = function() {
        var DOM = UICtrl.getDOMstrings();
        
    document.querySelector(DOM.inputBtn).addEventListener('click', ctrlAddItem);
        
    document.addEventListener('keypress', function(event) {
        if (event.keyCode === 13 || event.which === 13) {
            ctrlAddItem();
            } 
        });
        
    document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem);
        
        
    };
    
    
    var updateBudget = function() {
        
        // calculate budget 
        
        budgetCtrl.calculateBudget();
        
        // method to return the budget
        
        var budget = budgetCtrl.getBudget();
        
        // display the budget on the UI.
        UICtrl.displayBudget(budget);
        
    };
    
    var updatePercentages = function() {
      
        // calculate percentage
        budgetCtrl.calculatePercentages();
        
        // read percentage from budget controller
        var percentages = budgetCtrl.getPercentage();
        
        // update the ui with new percentage
        UICtrl.displayPercentages(percentages);
    };
    
    var ctrlAddItem = function() {
        var input, newItem;
        // get the filed input data
        input = UICtrl.getInput();
        
        if (input.description !== "" && !isNaN(input.value) && input.value > 0) {
        
        // add the item to the budget controller
        newItem = budgetCtrl.addItem(input.type, input.description, input.value);
        
        // add the item to the ui
        UICtrl.addListItem(newItem, input.type);
        
        // clear the fields
        UICtrl.clearFields();
        
        
        // calculate and update budget
        updateBudget();
            
        // calculate and update percentages
        updatePercentages();    
            
            
        }
    };
    
    var ctrlDeleteItem = function(event) {
        var itemID, splitID, type, ID;
            itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;
            if (itemID) {
                
                splitID = itemID.split('-');
                type = splitID[0];
                ID = parseInt(splitID[1]);
                
                // delete item from data structure
                budgetCtrl.deleteItem(type, ID);
                
                // delete Item from user interface
                UICtrl.deleteListItem(itemID);
                
                // update and show the new budget
                updateBudget();
                
                // calculate and update percentages
                updatePercentages(); 
            }
    };
    
    return {
        init: function() {
            UICtrl.displayMonth();
            UICtrl.displayBudget({
                budget: 0,
                totalInc: 0,
                totalExp: 0,
                percentage: -1
            });
            setupEventListeners();
            
        }
    };
    
})(budgetController, UIController);

controller.init();







