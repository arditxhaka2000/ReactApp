﻿using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ReactAppTest.Server.Migrations
{
    /// <inheritdoc />
    public partial class CollectionV1 : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "CollectionsId",
                table: "Products",
                type: "int",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "Collections",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Name = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Description = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    ImageUrl = table.Column<string>(type: "nvarchar(max)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Collections", x => x.Id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Products_CollectionsId",
                table: "Products",
                column: "CollectionsId");

            migrationBuilder.AddForeignKey(
                name: "FK_Products_Collections_CollectionsId",
                table: "Products",
                column: "CollectionsId",
                principalTable: "Collections",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Products_Collections_CollectionsId",
                table: "Products");

            migrationBuilder.DropTable(
                name: "Collections");

            migrationBuilder.DropIndex(
                name: "IX_Products_CollectionsId",
                table: "Products");

            migrationBuilder.DropColumn(
                name: "CollectionsId",
                table: "Products");
        }
    }
}
