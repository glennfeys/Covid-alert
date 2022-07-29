module.exports = function(app) {
    const reporting_controller = require('./controllers/reporting-controller');
    let contact_controller = require('./controllers/interaction-controller');

    app.route('/');

    app.route('/location-reporting')
        .get(reporting_controller.get_all)
        .post(reporting_controller.report);

    app.route('/contacts-reporting')
        .post(contact_controller.report);

    app.route('/token')
        .get(reporting_controller.get_token);
};
