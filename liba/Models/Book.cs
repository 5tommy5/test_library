using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace liba.Models
{
    public class Book
    {
        public int Id { get; set; }
        public string Title { get; set; }
        public int Year { get; set; }
        public int Downloads { get; set; }
        public string File { get; set; }
        public string Img { get; set; }
        public string Author { get; set; }
    }
}
