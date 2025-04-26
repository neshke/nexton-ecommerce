<?php
class Product
{
  // Database connection and table name
  private $conn;
  private $table_name = "products";

  // Object properties
  public $id;
  public $kategorija_id;
  public $naziv;
  public $slug;
  public $opis;
  public $cena;
  public $akcijska_cena;
  public $slika_url;
  public $dodatne_slike;
  public $kolicina_na_stanju;
  public $istaknuto;
  public $aktivan;
  public $kreirano_at;
  public $azurirano_at;
  public $kategorija_naziv;

  // Constructor with database connection
  public function __construct($db)
  {
    $this->conn = $db;
  }

  // Get all products
  public function getAll()
  {
    $query = "SELECT 
                    p.id, p.naziv, p.slug, p.opis, p.cena, p.akcijska_cena, 
                    p.kategorija_id, p.slika_url, p.kolicina_na_stanju, p.istaknuto, p.aktivan, 
                    p.kreirano_at, c.naziv as kategorija_naziv 
                FROM 
                    " . $this->table_name . " p
                    LEFT JOIN categories c ON p.kategorija_id = c.id
                ORDER BY 
                    p.kreirano_at DESC";

    $stmt = $this->conn->prepare($query);
    $stmt->execute();

    $products = [];
    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
      $products[] = $row;
    }

    return $products;
  }

  // Get one product
  public function getOne()
  {
    $query = "SELECT 
                    p.id, p.naziv, p.slug, p.opis, p.cena, p.akcijska_cena, 
                    p.kategorija_id, p.slika_url, p.dodatne_slike, p.kolicina_na_stanju, p.istaknuto, 
                    p.aktivan, p.kreirano_at, c.naziv as kategorija_naziv 
                FROM 
                    " . $this->table_name . " p
                    LEFT JOIN categories c ON p.kategorija_id = c.id
                WHERE 
                    p.id = :id
                LIMIT 0,1";

    $stmt = $this->conn->prepare($query);
    $stmt->bindParam(':id', $this->id);
    $stmt->execute();

    $row = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($row) {
      return $row;
    }

    return false;
  }

  // Get products by category
  public function getByCategory()
  {
    $query = "SELECT 
                    p.id, p.naziv, p.slug, p.opis, p.cena, p.akcijska_cena, 
                    p.kategorija_id, p.slika_url, p.kolicina_na_stanju, p.istaknuto, p.aktivan, 
                    p.kreirano_at, c.naziv as kategorija_naziv 
                FROM 
                    " . $this->table_name . " p
                    LEFT JOIN categories c ON p.kategorija_id = c.id
                WHERE 
                    p.kategorija_id = :kategorija_id
                ORDER BY 
                    p.kreirano_at DESC";

    $stmt = $this->conn->prepare($query);
    $stmt->bindParam(':kategorija_id', $this->kategorija_id);
    $stmt->execute();

    $products = [];
    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
      $products[] = $row;
    }

    return $products;
  }

  // Create product
  public function create()
  {
    $query = "INSERT INTO " . $this->table_name . " 
                (naziv, slug, opis, cena, kategorija_id, kolicina_na_stanju, slika_url, istaknuto, aktivan) 
                VALUES 
                (:naziv, :slug, :opis, :cena, :kategorija_id, :kolicina_na_stanju, :slika_url, :istaknuto, :aktivan)";

    $stmt = $this->conn->prepare($query);

    // Sanitize inputs
    $this->naziv = htmlspecialchars(strip_tags($this->naziv));
    $this->slug = htmlspecialchars(strip_tags($this->slug));
    $this->opis = htmlspecialchars(strip_tags($this->opis));
    $this->cena = floatval($this->cena);
    $this->kategorija_id = intval($this->kategorija_id);
    $this->kolicina_na_stanju = intval($this->kolicina_na_stanju);
    $this->istaknuto = intval($this->istaknuto);
    $this->aktivan = intval($this->aktivan);

    // Bind values
    $stmt->bindParam(':naziv', $this->naziv);
    $stmt->bindParam(':slug', $this->slug);
    $stmt->bindParam(':opis', $this->opis);
    $stmt->bindParam(':cena', $this->cena);
    $stmt->bindParam(':kategorija_id', $this->kategorija_id);
    $stmt->bindParam(':kolicina_na_stanju', $this->kolicina_na_stanju);
    $stmt->bindParam(':slika_url', $this->slika_url);
    $stmt->bindParam(':istaknuto', $this->istaknuto);
    $stmt->bindParam(':aktivan', $this->aktivan);

    // Execute query
    if ($stmt->execute()) {
      $this->id = $this->conn->lastInsertId();
      return true;
    }

    return false;
  }

  // Update product
  public function update()
  {
    $query = "UPDATE " . $this->table_name . " 
                SET 
                    naziv = COALESCE(:naziv, naziv),
                    opis = COALESCE(:opis, opis),
                    cena = COALESCE(:cena, cena),
                    kategorija_id = COALESCE(:kategorija_id, kategorija_id),
                    kolicina_na_stanju = COALESCE(:kolicina_na_stanju, kolicina_na_stanju),
                    slika_url = COALESCE(:slika_url, slika_url),
                    istaknuto = COALESCE(:istaknuto, istaknuto),
                    aktivan = COALESCE(:aktivan, aktivan)
                WHERE 
                    id = :id";

    $stmt = $this->conn->prepare($query);

    // Bind parameters
    $stmt->bindParam(':id', $this->id);
    $stmt->bindParam(':naziv', $this->naziv);
    $stmt->bindParam(':opis', $this->opis);
    $stmt->bindParam(':cena', $this->cena);
    $stmt->bindParam(':kategorija_id', $this->kategorija_id);
    $stmt->bindParam(':kolicina_na_stanju', $this->kolicina_na_stanju);
    $stmt->bindParam(':slika_url', $this->slika_url);
    $stmt->bindParam(':istaknuto', $this->istaknuto);
    $stmt->bindParam(':aktivan', $this->aktivan);

    // Execute query
    if ($stmt->execute()) {
      return true;
    }

    return false;
  }

  // Delete product
  public function delete()
  {
    $query = "DELETE FROM " . $this->table_name . " WHERE id = :id";

    $stmt = $this->conn->prepare($query);
    $stmt->bindParam(':id', $this->id);

    if ($stmt->execute()) {
      return true;
    }

    return false;
  }

  // Create slug from product name
  public function createSlug($string)
  {
    $slug = strtolower(trim(preg_replace('/[^A-Za-z0-9-]+/', '-', $string)));
    return $slug;
  }
}
?>