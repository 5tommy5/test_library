using liba.Models;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace liba
{
    public static class ModelBuilderExtensions
    {
        public static void Seed(this ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<User>().HasData(
                new User
                {
                    Id = 1,
                    Login = "admin@gmail.com",
                    Password = "AHQaxFuYJoGayJG+DDC9NNtkPAVDQCZEjIAySPOW4HdQZ+geFtMlk3Wu9L1mEjYrdA==", //"admin"
                    Role = "admin"
                }
            );

        }
    }

}
