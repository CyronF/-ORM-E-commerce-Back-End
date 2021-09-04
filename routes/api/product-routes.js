const router = require('express').Router();
const { Product, Category, Tag, ProductTag } = require('../../models');

// The `/api/products` endpoint

// get all products
router.get('/', async (req, res) => {
  // find all products
  // be sure to include its associated Category and Tag 
  try {
    const productData = await Product.findAll({
      include:[
        {
          model: Tag,
          through: ProductTag
        }]
    });
    res.status(200).json(productData);
  } catch (err) {
    res.status(500).json(err);
  }
});

// get one product
router.get('/:id', async (req, res) => {
  // find a single product by its `id`
  // be sure to include its associated Category and Tag data
  try {
    const productData = await Product.findByPk(req.params.id, 
      {
      include: [
        { 
          model: Tag, 
          through: ProductTag, 
        },
        { 
          model: Category
        },
      ]
    });

   if(!productData){
      res.status(404).json({message: "No product was found with that ID"});
      return;
    }

    res.status(200).json(productData);
  } catch (err) {
    res.status(500).json(err);
  }
});

// create new product
router.post('/', (req, res) => {
  /* req.body should look like this...
    {
      product_name: "Basketball",
      price: 200.00,
      stock: 3,
      tagIds: [1, 2, 3, 4]
    }
  */
   Product.create(req.body)
    .then((product) => {
      // if there's product tags, create pairings to bulk create in the ProductTag model 
      if (req.body.tagIds?.length) {
        const productTagIdArr = req.body.tagIds.map((tag_id) => {
          return {
            product_id: product.id,
            tag_id,
          };
        });
        return ProductTag.bulkCreate(productTagIdArr);
      }
      console.log(product)
      // if no product tags, just respond
      res.status(200).json(product);
    })
    .then((productTagIds) => res.status(200).json(productTagIds))
    .catch((err) => {
      console.log(err);
      res.status(400).json(err);
    });
});

// update product
router.put('/:id', (req, res, next) => {
    // update product data  
        Product.update(req.body
    //  {
  //    product_name: req.body.product_name,
  //    price: req.body.price,
  //    stock: req.body.stock,
  //    category_id: req.body.category_id
  //  } 
  ,{     

    where: {
      id: req.params.id,
    },
    // returning:true,
    // plain:true,  
  })
    .then((rowsChanged) => {
      // find all associated tags from ProductTag
     console.log(rowsChanged)
     //if no rows changed
     if (rowsChanged[0] > 0){      
       //return changed id
       return res.json(req.params.id)
     }
      //set status as 400
      res.status(400)

    //return the error/pas to error handling middleware   
      return (res.json({success:false, error: "product id not found"}))
    
    })
    .catch(console.log)
})


router.delete('/:id', async (req, res) => {
  // delete one product by its `id` value
  try {
    const productData = await Product.destroy({
      where: {
        id: req.params.id,
      },
    });

    if (!productData) {
      res.status(404).json({ message: "No product was found with that ID" });
      return;
    }

    res.status(200).json(productData);
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;