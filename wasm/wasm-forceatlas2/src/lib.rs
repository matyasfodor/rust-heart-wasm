mod utils;

extern crate serde_json;
extern crate wasm_bindgen;

use forceatlas2::{Coord, Layout, Nodes, Settings};
use serde::{Deserialize, Deserializer, Serialize};
use serde_derive::{Deserialize, Serialize};
use wasm_bindgen::prelude::*;
use std::panic;

// #[macro_use]
extern crate serde_derive;

// When the `wee_alloc` feature is enabled, use `wee_alloc` as the global
// allocator.
#[cfg(feature = "wee_alloc")]
#[global_allocator]
static ALLOC: wee_alloc::WeeAlloc = wee_alloc::WeeAlloc::INIT;

#[wasm_bindgen]
extern "C" {
    fn alert(s: &str);
}


#[wasm_bindgen]
extern "C" {
    // Use `js_namespace` here to bind `console.log(..)` instead of just
    // `log(..)`
    #[wasm_bindgen(js_namespace = console)]
    fn log(s: &str);

    // The `console.log` is quite polymorphic, so we can bind it with multiple
    // signatures. Note that we need to use `js_name` to ensure we always call
    // `log` in JS.
    #[wasm_bindgen(js_namespace = console, js_name = log)]
    fn log_u32(a: u32);

    // Multiple arguments too!
    #[wasm_bindgen(js_namespace = console, js_name = log)]
    fn log_many(a: &str, b: &str);
}

#[wasm_bindgen]
pub fn greet() {
    alert("Hello, forceatlas2-wasm!");
}

// struct SimpleStruct {

// }

// #[derive(Serialize, Deserialize)]
// struct LayoutSettings<T: Coord>(Settings<T>);

// impl<'de> Deserialize<'de> for LayoutSettings<f32> {
//     fn deserialize<D>(deserializer: D) -> Result<Self, D::Error>
//     where
//         D: Deserializer<'de>,
//     {
//         //    #[derive(Deserialize)]
//         //    #[serde(field_identifier, rename_all = "lowercase")]
//         //    enum Field { Secs, Nanos }
//     }
// }

#[derive(Serialize, Deserialize, Debug)]
pub struct GenerateLayoutParameters {
    pub edges: Vec<(usize, usize)>,
    pub nodes: usize,
}
#[wasm_bindgen]
pub fn generate_layout(parameters: JsValue) -> String {
    utils::set_panic_hook();
    let parsed_parameters = serde_wasm_bindgen::from_value::<GenerateLayoutParameters>(parameters).expect("Failed to parse parameters");

    let mut layout = Layout::<f32>::from_graph(
        parsed_parameters.edges,
        Nodes::Degree(parsed_parameters.nodes),
        None,
        Settings {
            #[cfg(feature = "barnes_hut")]
            barnes_hut: None,
            chunk_size: None,
            dimensions: 2,
            dissuade_hubs: false,
            ka: 0.01,
            kg: 0.001,
            kr: 0.002,
            lin_log: false,
            speed: 1.0,
            prevent_overlapping: None,
            strong_gravity: false,
        },
    );

    let ITERATIONS = 100usize;
    for i in 0..ITERATIONS {
        print!("{}/{}\r", i, ITERATIONS);
        layout.iteration();
    }

    let ret: Vec<(f32, f32)> = layout.points.iter().map(|pos| (pos[0], pos[1])).collect();

    serde_json::to_string(&ret).unwrap()
}
