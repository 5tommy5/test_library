using liba.Models;
using Microsoft.AspNetCore.Http;


namespace liba.ViewModels
{
    public class CreateBook
    {
        public int? id { get; set; }
        public string title{ get; set; }
        public string author { get; set; }
        public string year { get; set; }
        public IFormFile uploadedFile { get; set; }
        public IFormFile img { get; set; }

    }
}
