var passport = require('passport');
var SamlStrategy = require('passport-saml').Strategy;
var config = require('./config.json')[process.env.NODE_ENV || 'dev'];

//users array to hold
var users = [];

function findByEmail(email, fn) {
    for (var i = 0, len = users.length; i < len; i++) {
        var user = users[i];
        if (user.email === email) {
            return fn(null, user);
        }
    }
    return fn(null, null);
}

// Passport session setup.
//   To support persistent login sessions, Passport needs to be able to
//   serialize users into and deserialize users out of the session.  Typically,
//   this will be as simple as storing the user ID when serializing, and finding
//   the user by ID when deserializing.
passport.serializeUser(function(user, done) {
    done(null, user.email);
});

passport.deserializeUser(function(id, done) {
    findByEmail(id, function(err, user) {
        done(err, user);
    });
});

passport.use(new SamlStrategy(
    {
        entryPoint: 'https://dev-18365449.okta.com/app/dev-18365449_nodejs_1/exk3ycqdriw1rFCcW5d7/sso/saml',
        issuer: 'http://www.okta.com/exk3ycqdriw1rFCcW5d7',
        callbackUrl: 'https://localhost:3000/',
        cert: 'MIIDqDCCApCgAwIBAgIGAXnvp9ysMA0GCSqGSIb3DQEBCwUAMIGUMQswCQYDVQQGEwJVUzETMBEG' /
        'A1UECAwKQ2FsaWZvcm5pYTEWMBQGA1UEBwwNU2FuIEZyYW5jaXNjbzENMAsGA1UECgwET2t0YTEU'/
        'MBIGA1UECwwLU1NPUHJvdmlkZXIxFTATBgNVBAMMDGRldi0xODM2NTQ0OTEcMBoGCSqGSIb3DQEJ'/
        'ARYNaW5mb0Bva3RhLmNvbTAeFw0yMTA2MDkwNzIyNDZaFw0zMTA2MDkwNzIzNDVaMIGUMQswCQYD'/
        'VQQGEwJVUzETMBEGA1UECAwKQ2FsaWZvcm5pYTEWMBQGA1UEBwwNU2FuIEZyYW5jaXNjbzENMAsG'/
        'A1UECgwET2t0YTEUMBIGA1UECwwLU1NPUHJvdmlkZXIxFTATBgNVBAMMDGRldi0xODM2NTQ0OTEc'/
        'MBoGCSqGSIb3DQEJARYNaW5mb0Bva3RhLmNvbTCCASIwDQYJKoZIhvcNAQEBBQADggEPADCCAQoC'/
        'ggEBAIyQSke+iJGODTftMb0Bb4HnTiDtpk2dH0lqlToW7qmXRLeMWZ6QhMHF9WQcjxsAXCkrXDOD'/
        'NdFvxHC0dL8T8N+tEjNdMYVQe/dIvURl22hPRQioddMN9NFQeRZPjRnhyROj3J7S6JFamt7Vx174'/
        'KoVx68k78iqYnZjKEuz+PaXX81pBArktT3ZK2zB2WklOaKGqyPn5p0ykfmQY8OWcuVedxDeIui/z'/
        'EuC2K1lxQhNlhQGtaUCX8kdUxm/DL1UvfgEVXTnu0+iBCWGQum2GI8lOjTX6iC6przs5oZmnTWdO'/
        'gxykJdJLUd7FkYnooPBKUAreKRKfdaMNBzkiibBvrAkCAwEAATANBgkqhkiG9w0BAQsFAAOCAQEA'/
        'OemiVF2Mf1NTRqXEizH6TNCH+ACHMob29LmPQ0YmVWHD6g1ryHDdOZGyzE0ezdwH6li/W3Em3czL'/
        'a4T5cQME9qyVw80JRqZAkQTT+bwvpBdwbmwaXwLDaQLySwM9u6gjGbSKwCZt7MNVQkPoV6ge5H0z'/
        'q3oEK0DXQGabMlvZH4G70UAjKpOTyaEZLT3bTY42ikuGhNBuYGRn2hyy6A/mjwV2Ua/sNOinFpaW'/
        's3tdjaPZkWMJn3ay/I7e/WzZxQO6vXmHDuJzn3BqrhIKRFIeJX/7SbH21afe27p7WN7yF0wuVJtC'/
        '8ykOdOHjvMtyvT/o2F3ffe3O6xGuAnE4FqW3TA=='
    
      },
    function(profile, done) {
        console.log('Succesfully Profile'+ profile);
        if (!profile.email) {
            return done(new Error("No email found"), null);
        }
        process.nextTick(function() {
            console.log('process.nextTick',  profile);
            findByEmail(profile.email, function(err, user) {
                if (err) {
                    return done(err);
                }
                if (!user) {
                    users.push(profile);
                    return done(null, profile);
                }
                console.log('Ending Method for profiling');
                return done(null, user);
            })
        });
    }
));

passport.protected = function protected(req, res, next) {
    console.log('Login Profile' + req.isAuthenticated());
    if (req.isAuthenticated()) {
        return next();
    }
    console.log('login please' + req.isAuthenticated());
    res.redirect('/login');
};

exports = module.exports = passport;