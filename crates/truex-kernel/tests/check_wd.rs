#[test]
fn check_working_directory() {
    let wd = std::env::current_dir().unwrap();
    println!("Working directory during test: {:?}", wd);

    let paths = vec![
        "truex_kernel/tests/fixtures/BPI_2020_Travel_Permits_Actual.xes",
        "truex_kernel/truex_kernel/tests/fixtures/BPI_2020_Travel_Permits_Actual.xes",
        "tests/fixtures/BPI_2020_Travel_Permits_Actual.xes",
        "tests/fixtures/BPI_2020_Domestic_Declarations.xes",
        "./BPI_2020_Travel_Permits_Actual.xes",
    ];

    for path in paths {
        let exists = std::path::Path::new(path).exists();
        println!("{}: {}", path, exists);
    }
}
