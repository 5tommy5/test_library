using liba.Models;
using liba.ViewModels;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;

namespace liba.Controllers
{
    [Route("api/[controller]/[action]")]
    [ApiController]
    [Authorize(Roles ="admin")]
    public class AdminController : ControllerBase
    {
        private readonly ApplicationContext _db;
        IWebHostEnvironment _appEnvironment;
        public AdminController(ApplicationContext db, IWebHostEnvironment appEnvironment)
        {
            _db = db;
            _appEnvironment = appEnvironment;
        }
        [HttpPost]
        [RequestFormLimits(MultipartBodyLengthLimit = 209715200)]
        [RequestSizeLimit(209715200)]
        public async Task<IActionResult> CreateBook([FromForm] CreateBook b)
        {
            string[] permittedextensions = { ".txt", ".pdf" };
            string[] permittedextensionsImg = { ".png", ".jpg", ".jpeg" };

            if (Int32.Parse(b.year)>DateTime.Now.Year || Int32.Parse(b.year) < 0)
            {
                return BadRequest(new { message = "Please, select valid year!" });

            }
            if (_db.Books.Where(x=>x.Title == b.title).Any())
            {
                return BadRequest(new { message = "There is already book with such name!"});
            }
            Book book = new Book();
            if (!Request.HasFormContentType)
                return BadRequest(new { message = "Hmm... its not working. Message to developer, please!"});

            var form = Request.Form;
            try
            {
                if (form.Files[1].FileName == null)
                {
                    return BadRequest(new { message = "Please, add file and image!" });
                }
            }
            catch (Exception)
            {
                return BadRequest(new { message = "Please, add file and image!" });

            }

            if (form.Files[0].FileName == null)
            {
                return BadRequest(new { message = "Please, add file and image!" });
            }
            using (var readStream = form.Files[1].OpenReadStream())
            {
                var dateStr = DateTime.Now.ToString().Replace(".", "").Replace(" ", "").Replace(":", "");

                string path = "/Files/" + b.title + "_" + dateStr + "_" + b.uploadedFile.FileName;
                path = path.Replace("#", "sharp");
                path = path.Replace(" ", "");
                
                var ext = Path.GetExtension(path);

                if (!permittedextensions.Contains(ext))
                {
                    return BadRequest(new { message = "Files allows only .PDF extension!"});
                }
                if (string.IsNullOrEmpty(ext))
                {
                    return BadRequest(new { message = "Add file!" });

                }
                using (var fileStream = new FileStream(_appEnvironment.WebRootPath + path, FileMode.Create))
                {
                    await b.uploadedFile.CopyToAsync(fileStream);
                }
                book.File = path;
            }

            //if (b.uploadedFile != null)
            //{
            //    // путь к папке Files
            //    string path = "/Files/"+b.title +"_" + b.uploadedFile.FileName;
            //    path = path.Replace("#", "sharp");

            //    // сохраняем файл в папку Files в каталоге wwwroot
            //    using (var fileStream = new FileStream(_appEnvironment.WebRootPath + path, FileMode.Create))
            //    {
            //        await b.uploadedFile.CopyToAsync(fileStream);
            //    }
            //    book.File = path;

            //}
            using (var readStream = form.Files[0].OpenReadStream())
            {
                // путь к папке Files
                var dateStr = DateTime.Now.ToString().Replace(".", "").Replace(" ", "").Replace(":", "");

                string path = "/img/" + b.title + "_" + dateStr + "_" + b.img.FileName;
                path = path.Replace("#", "sharp");
                path = path.Replace(" ", "");
                var ext = Path.GetExtension(path);

                if ( !permittedextensionsImg.Contains(ext))
                {
                    return BadRequest(new { message = "Images can be only .PNG, .JPEG, .JPG extension!" });
                }
                if (string.IsNullOrEmpty(ext))
                {
                    return BadRequest(new { message = "Add image!" });

                }
                // сохраняем файл в папку Files в каталоге wwwroot
                using (var fileStream = new FileStream(_appEnvironment.WebRootPath + path, FileMode.Create))
                {
                    await b.img.CopyToAsync(fileStream);
                }
                book.Img = path;

            }
            book.Author = b.author;
            book.Downloads = 0;
            book.Title = b.title;
            book.Year = Int32.Parse(b.year);
            _db.Books.Add(book);
            _db.SaveChanges();
            return Ok();
        }
        [HttpPost]
        [RequestFormLimits(MultipartBodyLengthLimit = 209715200)]
        [RequestSizeLimit(209715200)]
        public async Task<IActionResult> EditBook([FromForm] CreateBook b)
        {
            string[] permittedextensions = { ".pdf" };
            string[] permittedextensionsImg = { ".png", ".jpg", ".jpeg" };
            try
            {
                if (Int32.Parse(b.year) > DateTime.Now.Year || Int32.Parse(b.year) < 0)
                {
                    return BadRequest(new { message = "Please, select valid year!" });

                }
                var book1 = _db.Books.First(x => x.Id == b.id);

                if (_db.Books.Where(x => x.Title == b.title).Any())
                {
                    var books = _db.Books.Where(x => x.Title == b.title).Count();
                    if(books > 1 || (book1.Id != _db.Books.First(x=>x.Title == b.title).Id && books == 1))
                        return BadRequest( new { message = "There is already book with such name!"});
                }
                if (b.uploadedFile != null)
                {
                    var dateStr = DateTime.Now.ToString().Replace(".", "").Replace(" ", "").Replace(":", "");

                    string path = "/Files/" + b.title + "_" + dateStr + "_" + b.uploadedFile.FileName;
                    path = path.Replace("#", "sharp");
                    path = path.Replace(" ", "");

                    var ext = Path.GetExtension(path);

                    if (!permittedextensions.Contains(ext))
                    {
                        return BadRequest(new { message = "Files allows only .PDF extension!" });
                    }

                    // сохраняем файл в папку Files в каталоге wwwroot
                    using (var fileStream = new FileStream(_appEnvironment.WebRootPath + path, FileMode.Create))
                    {
                        await b.uploadedFile.CopyToAsync(fileStream);
                        fileStream.Flush();
                    }
                    book1.File = path;

                }

                if (b.img != null)
                {
                    var dateStr = DateTime.Now.ToString().Replace(".", "").Replace(" ", "").Replace(":", "");
                    string path = "/img/" + b.title + "_" + dateStr + "_" + b.img.FileName;
                    path = path.Replace("#", "sharp");
                    path = path.Replace(" ", "");


                    var ext = Path.GetExtension(path);
                    if (!permittedextensionsImg.Contains(ext))
                    {
                        return BadRequest(new { message = "Images can be only .PNG, .JPEG, .JPG extension!" });
                    }

                    // сохраняем файл в папку Files в каталоге wwwroot
                    using (var fileStream = new FileStream(_appEnvironment.WebRootPath + path, FileMode.Create))
                    {
                        await b.img.CopyToAsync(fileStream);
                    }
                    book1.Img = path;

                }
                book1.Author = b.author;
                book1.Title = b.title;
                book1.Year = Int32.Parse(b.year);
                _db.SaveChanges();
                return Ok();
            }
            catch (Exception)
            {
                return BadRequest();
            }
        }
        [HttpPost]
        public IActionResult DeleteBook(DownloadBook b)
        {
            try
            {
                var book = _db.Books.Find(b.Id);
                _db.Books.Remove(book);
                _db.SaveChanges();
                return Ok();
            }
            catch (Exception)
            {
                return BadRequest();
            }
        }
    }
}
