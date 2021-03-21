using liba.ViewModels;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace liba.Controllers
{
    [Route("api/[controller]/[action]")]
    [ApiController]
    public class UserController : ControllerBase
    {
        private readonly ApplicationContext _db;
        public UserController(ApplicationContext db)
        {
            _db = db;
        }
        [HttpGet]
        [AllowAnonymous]
        public IActionResult GetBooks(string search = "", int year1 = 0, int year2 = 2200, string author = "")
        {
            try
            {
                search = search != null ? search : "";
                author = author != null ? author : "";

                var books = _db.Books.Where(x => x.Title.Contains(search) && x.Year >= year1 && x.Year <= year2 && x.Author.Contains(author)).OrderByDescending(x=>x.Id).ToList();
                return Ok(new { books = books });
            }
            catch(Exception)
            {
                return BadRequest();
            }
        }
        [HttpPost]
        [Authorize]
        public IActionResult Download(DownloadBook b)
        {
            try
            {
                var book = _db.Books.First(x => x.Id == b.Id);
                book.Downloads += 1;
                _db.SaveChanges();
                return Ok();
            }
            catch (Exception)
            {
                return BadRequest();
            }
        }
        [HttpPost]
        public IActionResult GetBook(DownloadBook id)
        {
            try
            {
                var book = _db.Books.Find(id.Id);
                return Ok(book);
            }
            catch(Exception)
            {
                return BadRequest();
            }
        }
    }
}
