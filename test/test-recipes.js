// Load testing tools
const chai = require('chai');
const chaiHttp = require('chai-http');

// Load items for running server
const {app, runServer, closeServer} = require("../server");

// Simplify use of chai expect
const expect = chai.expect;

// Load HTTP testing into chair
chai.use(chaiHttp);

// Test '/recipes' operations
describe('Recipes', function() {
  
  // Start server before running tests
  before(function() {
    return runServer();
  });
  
  // Close server after running tests
  after(function() {
    return closeServer();
  });
  
  // Test GET method
    // Strategy:
    // 1. Make GET request to /recipes
    // 2. Examine response object for:
    //    - Correct status code
    //    - Object with correct keys
  it('should list recipes on GET', function(){
    
    // Run test
    return chai
      .request(app)
      .get('/recipes')
      .then(function(res){
          expect(res).to.have.status(200);
          expect(res).to.be.json;
          expect(res.body).to.be.a('array');
          
          // Confirm there are items
          expect(res.body.length).to.be.at.least(1);
          
          // Confirm each object has correct keys
          const expectedKeys = ['id', 'name', 'ingredients'];
          res.body.forEach(function(item){
            expect(item).to.be.a('object');
            expect(item).to.include.keys(expectedKeys);
          });
      });
  });
  
  // Test POST method
    // Strategy:
    // 1. Make a POST request to /recipes with a new item
    // 2. Examine the response object for:
    //    - Correct status code
    //    - The submitted object, plus an id
    it('should add anitem on POST', function() {
      
      // Create new item
      const newRecipe = {name: "Curry", ingredients: ["Lamb", "Spices"]};
      
      // Run test
      return chai
        .request(app)
        .post('/recipes')
        .send(newRecipe)
        .then(function(res) {
          expect(res).to.have.status(201);
          expect(res).to.be.json;
          expect(res.body).to.be.a('object');
          expect(res.body).to.include.keys('id', 'name', 'ingredients');
          expect(res.body.id).to.not.equal('null');
          // Confirm it's returning the same recipe, with its new ID
          expect(res.body).to.deep.equal(
            Object.assign(newRecipe, {id: res.body.id})
          );
        });
    });
    
  // Test PUT method
    // Strategy
    // 1. Create some data with which to edit an object
    // 2. Send a GET request to collect a valid ID to edit
    // 3. Add the ID to the edit data
    // 4. Make  PUT request with the new data
    // 5. Examine the response object for:
    //    - Correct status code
    //    - The updated object
    it('should update recipes on PUT', function() {
      
      // Create updateData object
      const updateData = {
        name: "Curry",
        ingredients: ["Lamb", "Spices"]
      };
      
      // Run test
      return (
        chai
          .request(app)
          // Get ID of object to edit
          .get('/recipes')
          .then(function(res) {
            updateData.id = res.body[0].id;
            
            // Send PUT to edit data
            return chai
              .request(app)
              .put(`/recipes/${updateData.id}`)
              .send(updateData);
          })
          .then(function(res) {
            // Examine PUT response
            expect(res).to.have.status(204);
            
            // Not sure if this intentional, but PUT /recipes/:id
            // in the cloned git returns res.status(204).end();
            // so there's no object to test. Otherwise...
            
            // expect(res).to.be.json;
            // expect(res.body).to.be.a('object');
            // expect(res.body).to.deep.equal(updateData);
          })
      );
    });
  
  // Test DELETE method
  // Strategy:
  // 1. GET recipes, so we can delete one
  // 2. DELETE an item and confirm response status
  it('should delete items on DELETE', function() {
    return(
      
      chai
        .request(app)
        // Get ID of object to delete
        .get('/recipes')
        .then(function(res){
          return chai
            .request(app)
            .delete(`/recipes/${res.body[0].id}`);
        })
        .then(function(res){
          expect(res).to.have.status(204);
        })
    );
  });
});