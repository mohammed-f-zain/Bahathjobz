// import passport from 'passport';
// import { PrismaClient } from '@prisma/client';
// import { Strategy as GoogleStrategy } from 'passport-google-oauth20';

// const prisma = new PrismaClient();

// passport.use(
//   new GoogleStrategy(
//     {
//       clientID: process.env.GOOGLE_CLIENT_ID,
//       clientSecret: process.env.GOOGLE_CLIENT_SECRET,
//       callbackURL: process.env.GOOGLE_CALLBACK_URL || "https://api.bahathjobz.com/api/auth/google/callback",
//     },
//     async (accessToken, refreshToken, profile, done) => {
//       try {
//         // Check if user exists
//         let user = await prisma.user.findUnique({
//           where: { email: profile.emails[0].value },
//         });

//         if (user) {
//           // If user exists, ensure their Google ID and avatar are up-to-date
//           if (!user.googleId || !user.avatar) {
//             user = await prisma.user.update({
//               where: { id: user.id },
//               data: {
//                 googleId: user.googleId || profile.id,
//                 avatar:
//                   user.avatar ||
//                   (profile.photos && profile.photos.length > 0
//                     ? profile.photos[0].value
//                     : null),
//               },
//             });
//           }
//         } else {
//           // If user does not exist, create a new user
//           const firstName =
//             profile.name?.givenName || profile.displayName.split(" ")[0];
//           const lastName =
//             profile.name?.familyName ||
//             profile.displayName.split(" ").slice(1).join(" ");

//           user = await prisma.user.create({
//             data: {
//               email: profile.emails[0].value,
//               first_name: firstName,
//               last_name: lastName,
//               googleId: profile.id,
//               avatar:
//                 profile.photos && profile.photos.length > 0
//                   ? profile.photos[0].value
//                   : null,
//               role: "job_seeker", // default role
//               is_active: true,
//             },
//           });
//         }

//         return done(null, user);
//       } catch (err) {
//         console.error("Google Strategy Error:", err);
//         return done(err, null);
//       }
//     }
//   )
// );

// // Serialize/Deserialize (required for session support)
// passport.serializeUser((user, done) => {
//   done(null, user.id);
// });

// passport.deserializeUser(async (id, done) => {
//   try {
//     const user = await prisma.user.findUnique({ where: { id } });
//     done(null, user);
//   } catch (err) {
//     done(err, null);
//   }
// });

// export default passport;

// server/middleware/passport.js
import passport from 'passport';
import { PrismaClient } from '@prisma/client';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL:
        process.env.GOOGLE_CALLBACK_URL ||
        'https://api.bahathjobz.com/api/v1/auth/google/callback',
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails[0]?.value;
        if (!email) return done(new Error('No email found in Google profile'));

        let user = await prisma.user.findUnique({ where: { email } });

        if (user) {
          // Update Google ID or avatar if missing
          if (!user.googleId || !user.avatar) {
            user = await prisma.user.update({
              where: { id: user.id },
              data: {
                googleId: user.googleId || profile.id,
                avatar:
                  user.avatar ||
                  profile.photos?.[0]?.value ||
                  null,
              },
            });
          }
        } else {
          // Create new user
          const firstName =
            profile.name?.givenName || profile.displayName.split(' ')[0];
          const lastName =
            profile.name?.familyName ||
            profile.displayName.split(' ').slice(1).join(' ');

          user = await prisma.user.create({
            data: {
              email,
              first_name: firstName,
              last_name: lastName,
              googleId: profile.id,
              avatar: profile.photos?.[0]?.value || null,
              role: 'job_seeker', // default role
              is_active: true,
            },
          });
        }

        return done(null, user);
      } catch (err) {
        console.error('Google Strategy Error:', err);
        return done(err, null);
      }
    }
  )
);

// ------------------- JWT-based auth (no session) -------------------
// Since we’re using JWT, we don’t need serialize/deserialize for sessions.
// But Passport still expects these functions to exist.
passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await prisma.user.findUnique({ where: { id } });
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});

export default passport;
