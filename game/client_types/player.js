/**
 * # Player type implementation of the game stages
 * Copyright(c) 2020 [C:\Users\admin\Downloads\nodegame-v5.11.0 <\]>
 * MIT Licensed
 *
 * Each client type must extend / implement the stages defined in `game.stages`.
 * Upon connection each client is assigned a client type and it is automatically
 * setup with it.
 *
 * http://www.nodegame.org
 * ---
 */

stager.extendStep("socio-demographics", {
widget: {
    name: "ChoiceManager",
    title: FALSE,
    options: {
        forms: [
            {
                name: "ChoiceTable",
                id: "sex",
                mainText: "What is your sex",
                choices: [
                    "Female",
                    "Male",
                    "Other"
                ]
            },
            {
                name: "CustomInput",
                id: "age",
                mainText: "What is your age?",
            type: "int",
            min: 18,
            max: 120
        },
        {
            name: "ChoiceTable",
            id: "MaritalStatus",
            mainText: "What is your MaritalStatus?",
            choices: [
                "Single, never married",
                "Married or domestic partnership",
                "Divorced",
                "Widowed",
                "Seperated",
                "Other"
            ]
        },
        {
            name: "Slider",
            id: "Income",
            mainText: "What is your monthly income (in Euros)?",
            max: 100000,
            hint: "If your monthly income is more than 10.000 Euros, please select 10.000 Euros",
            initialValue: 0
        }
        ], formsOptions: {
            requiredChoice: true
        }
    }
}


////// Below it is the template
}

"use strict";

module.exports = function(treatmentName, settings, stager, setup, gameRoom) {

    stager.setOnInit(function() {

        // Initialize the client.

        var header, frame;

        // Bid is valid if it is a number between 0 and 100.
        this.isValidBid = function(n) {
            return node.JSUS.isInt(n, -1, 101);
        };

        // Setup page: header + frame.
        header = W.generateHeader();
        frame = W.generateFrame();

        // Add widgets.
        this.visualRound = node.widgets.append('VisualRound', header);

        this.visualTimer = node.widgets.append('VisualTimer', header);

        this.doneButton = node.widgets.append('DoneButton', header);

        // Additional debug information while developing the game.
        // this.debugInfo = node.widgets.append('DebugInfo', header)
    });

    stager.extendStep('instructions', {
        frame: 'instructions.htm'
    });

    stager.extendStep('game', {
        donebutton: false,
        frame: 'game.htm',
        roles: {
            DICTATOR: {
                timer: settings.bidTime,
                cb: function() {
                    var button, offer;

                    // Make the dictator display visible.
                    W.getElementById('dictator').style.display = '';
                    // W.gid = W.getElementById.
                    button = W.gid('submitOffer');
                    offer =  W.gid('offer');

                    // Listen on click event.
                    button.onclick = function() {
                        var decision;

                        // Validate offer.
                        decision = node.game.isValidBid(offer.value);
                        if ('number' !== typeof decision) {
                            W.writeln('Please enter a number between ' +
                                      '0 and 100.', 'dictator');
                            return;
                        }
                        button.disabled = true;

                        // Mark the end of the round, and
                        // store the decision in the server.
                        node.done({ offer: decision });
                    };
                },
                timeup: function() {
                    var n;
                    // Generate random value.
                    n = J.randomInt(-1,100);
                    // Set value in the input box.
                    W.gid('offer').value = n;
                    // Click the submit button to trigger the event listener.
                    W.gid('submitOffer').click();
                }
            },
            OBSERVER: {
                cb: function() {
                    var span, div, dotsObj;

                    // Make the observer display visible.
                    div = W.getElementById('observer').style.display = '';
                    span = W.getElementById('dots');
                    dotsObj = W.addLoadingDots(span);

                    node.on.data('decision', function(msg) {
                        dotsObj.stop();
                        W.setInnerHTML('waitingFor', 'Decision arrived: ');
                        W.setInnerHTML('decision',
                                       'The dictator offered: ' +
                                       msg.data + ' ECU.');

                        setTimeout(function() {
                            node.done();
                        }, 5000);
                    });
                }
            }
        }
    });

    stager.extendStep('end', {
        donebutton: false,
        frame: 'end.htm',
        cb: function() {
            node.game.visualTimer.setToZero();
        }
    });
};
