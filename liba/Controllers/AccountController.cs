using System;
using System.Collections.Generic;
using System.Linq;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using liba.Models;
using liba.ViewModels;
using Microsoft.AspNetCore.Authorization;
using System.Security.Cryptography;
using System.Collections;

namespace liba.Controllers
{
    [Route("api/[controller]/[action]")]
    [ApiController]
    public class AccountController : ControllerBase
    {
        private readonly ApplicationContext _db;
        public AccountController(ApplicationContext db)
        {
            _db = db;
        }

        [HttpPost]
        public IActionResult Token([FromBody] Register r)
        {
            var identity = GetIdentity(r.Login, r.Password);
            if (identity == null)
            {
                return BadRequest(new { errorText = "Invalid username or password." });
            }

            var now = DateTime.UtcNow;
            // создаем JWT-токен
            var jwt = new JwtSecurityToken(
                issuer: AuthOptions.ISSUER,
                audience: AuthOptions.AUDIENCE,
                notBefore: now,
                claims: identity.Claims,
                expires: now.Add(TimeSpan.FromMinutes(AuthOptions.LIFETIME)),
                signingCredentials: new SigningCredentials(AuthOptions.GetSymmetricSecurityKey(), SecurityAlgorithms.HmacSha256));
            var encodedJwt = new JwtSecurityTokenHandler().WriteToken(jwt);

            var response = new
            {
                access_token = encodedJwt,
                username = identity.Name
            };

            return Ok(response);
        }
        [HttpPost]
        public IActionResult Register([FromBody]Register register)
        {
            try
            {
                if(_db.Users.Where(x => x.Login == register.Login).Any())
                {
                    return BadRequest(new { errorText = "There is such user already" });
                }

                _db.Users.Add(new User { Login = register.Login, Password = HashPassword(register.Password), Role = "user"});
                _db.SaveChanges();
                var token = Token(register);

                return token;
            }
            catch (Exception)
            {
                return BadRequest(new { errorText = "Something goes wrong" });
            }

        }

        private ClaimsIdentity GetIdentity(string username, string password)
        {
            try
            {
                User person = _db.Users.FirstOrDefault(x => x.Login == username);

                if (person != null)
                {
                    if (VerifyHashedPassword(person.Password, password))
                    {
                        var claims = new List<Claim>
                    {
                    new Claim(ClaimsIdentity.DefaultNameClaimType, person.Login),
                    new Claim(ClaimsIdentity.DefaultRoleClaimType, person.Role)
                    };
                        ClaimsIdentity claimsIdentity =
                        new ClaimsIdentity(claims, "Token", ClaimsIdentity.DefaultNameClaimType,
                        ClaimsIdentity.DefaultRoleClaimType);
                        return claimsIdentity;
                    }
                    return null;

                }
                return null;
            }
            catch (Exception)
            {
                return null;
            }

            
        }
        [Authorize]
        [HttpGet]
        public IActionResult GetLogin()
        {
            return Ok($"Ваш логин: {User.Identity.Name}");
        }
        [Authorize]
        [HttpGet]
        public IActionResult GetRole()
        {
            try
            {
                var user = _db.Users.First(x => x.Login == User.Identity.Name);
                return Ok(user.Role);
            }
            catch (Exception)
            {
                return BadRequest();
            }

        }
        private static string HashPassword(string password)
        {
            byte[] salt;
            byte[] buffer2;
            if (password == null)
            {
                throw new ArgumentNullException("password");
            }
            using (Rfc2898DeriveBytes bytes = new Rfc2898DeriveBytes(password, 0x10, 0x3e8))
            {
                salt = bytes.Salt;
                buffer2 = bytes.GetBytes(0x20);
            }
            byte[] dst = new byte[0x31];
            Buffer.BlockCopy(salt, 0, dst, 1, 0x10);
            Buffer.BlockCopy(buffer2, 0, dst, 0x11, 0x20);
            return Convert.ToBase64String(dst);
        }
        private static bool VerifyHashedPassword(string hashedPassword, string password)
        {
            byte[] buffer4;
            if (hashedPassword == null)
            {
                return false;
            }
            if (password == null)
            {
                throw new ArgumentNullException("password");
            }
            byte[] src = Convert.FromBase64String(hashedPassword);
            if ((src.Length != 0x31) || (src[0] != 0))
            {
                return false;
            }
            byte[] dst = new byte[0x10];
            Buffer.BlockCopy(src, 1, dst, 0, 0x10);
            byte[] buffer3 = new byte[0x20];
            Buffer.BlockCopy(src, 0x11, buffer3, 0, 0x20);
            using (Rfc2898DeriveBytes bytes = new Rfc2898DeriveBytes(password, dst, 0x3e8))
            {
                buffer4 = bytes.GetBytes(0x20);
            }
            return StructuralComparisons.StructuralEqualityComparer.Equals(buffer3, buffer4); 
        }
    }
}